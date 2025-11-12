import { Component, OnInit } from '@angular/core';
import { debounceTime, switchMap, of, filter } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';


import { EstadoDeOrden } from '../../../core/enums/estados-de-orden.model';
import { OrdenRecepcionService } from '../../../core/services/orden-recepcion.service';
import { DetalleOrdenRecepcionService } from '../../../core/services/detalle-orden-recepcion.service';
import { InventarioService } from '../../../core/services/inventario.service';
import { ProductoService } from '../../../core/services/producto.service';
import { ProveedoresService } from '../../../core/services/proveedores.service';
import { DetalleDespacho } from '../../../core/models/orden-despacho/detalle-despacho.model';
import { Proveedor } from '../../../core/models/proveedor/proveedor.model';
import { Producto } from '../../../core/models/Producto/producto.model';
import OrdenRecepcion from '../../../core/models/orden-recepcion/orden-recepcion.model';
import { DetalleRecepcion } from '../../../core/models/orden-recepcion/detalle-recepcion.model';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-orden-recepcion-form',
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './orden-recepcion-form.component.html',
  styleUrl: './orden-recepcion-form.component.css'
})
export class OrdenRecepcionFormComponent implements OnInit {
  public EstadoDeOrden = EstadoDeOrden;
  form!: FormGroup;
  editMode = false;
  idOrden = 0;
  
  // Modal para crear producto
  showProductModal = false;
  productForm!: FormGroup;
  activeDetalleIndex = 0; // Índice del detalle activo donde se seleccionará el producto

  // Modal para crear proveedor
  showProveedorModal = false;
  proveedorForm!: FormGroup;
  
  // Proveedor seleccionado para mostrar información
  proveedorSeleccionado: Proveedor | null = null;

  constructor(
    private formFactory: FormBuilder,
    private ordenRecepcionService: OrdenRecepcionService,
    private detalleOrdenRecepcionService: DetalleOrdenRecepcionService,
    private inventarioService: InventarioService,
    private productoService: ProductoService,
    private proveedoresService: ProveedoresService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.formFactory.nonNullable.group({
      idOrdenRecepcion: [0],
      idProveedor: [null, Validators.required],
      fecha: ["", Validators.required],
      estado: [EstadoDeOrden.PENDIENTE, Validators.required],
      detalles: this.formFactory.array([]),
    });

    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.editMode = true;
      this.idOrden = +id;
      this.ordenRecepcionService.buscarPorId(this.idOrden)
        .subscribe((response: OrdenRecepcion) => {
          const dataToPatch = {
            ...response,
            fecha: response.fecha
              ? new Date(response.fecha).toISOString().split("T")[0]
              : "",
          };
          this.form.patchValue(dataToPatch as any);
          this.detalles.clear();
          (response.detalleRecepcionDTOList || []).forEach((detalle: DetalleRecepcion) =>
            this.agregarDetalle(detalle)
          );
        });
    } else {
      this.agregarDetalle();
    }

    // Configurar listener para búsqueda de proveedor
    this.form.get('idProveedor')?.valueChanges.pipe(
      debounceTime(500),
      filter((id): id is number => !!id && id > 0),
      switchMap((id: number) => this.buscarProveedorPorId(id))
    ).subscribe();
  }

  get detalles(): FormArray {
    return this.form.get("detalles") as FormArray;
  }

  agregarDetalle(detalle?: DetalleRecepcion) {
    const grupo = this.formFactory.group({
      idDetalleRecepcion: [detalle?.idDetalleRecepcion || null],
      inputProducto: [detalle?.producto?.nombre || "", Validators.required],
      productoSeleccionado: [detalle?.producto || null],
      cantidad: [detalle?.cantidad || 1, [Validators.required, Validators.min(1)]],
      filteredProducts: [[] as Producto[]],
      stockDisponible: [0],
    });

   grupo
      .get("inputProducto")
      ?.valueChanges.pipe(
        debounceTime(400),
        filter((valor): valor is string => !!valor && valor.trim() !== ""),
        switchMap((valor: string) =>
          this.productoService.buscarPorNombreOCodigo(valor).pipe(
            switchMap((productos: Producto[]) => {
              grupo.patchValue(
                { filteredProducts: productos },
                { emitEvent: false }
              );

              const exact = productos.find(
                (p) =>
                  valor.toLowerCase() === p.nombre.toLowerCase() ||
                  valor.toLowerCase() === p.codigoSku.toLowerCase()
              );
              if (exact)
                this.seleccionarProducto(this.detalles.length - 1, exact);

              return of(productos);
            })
          )
        )
      )
      .subscribe();

    this.detalles.push(grupo);
  }

  seleccionarProducto(index: number, producto: Producto | null) {
    if (!producto) return;
    const detalle = this.detalles.at(index);
    detalle.patchValue({
      productoSeleccionado: producto,
      inputProducto: `${producto.nombre} (${producto.codigoSku})`,
    });

    this.inventarioService
      .obtenerStockPorProductoPorId(producto.idProducto!)
      .subscribe((stock) => {
        detalle.patchValue({ stockDisponible: stock });
      });
  }

  eliminarDetalle(index: number) {
    this.detalles.removeAt(index);
  }

  get detallesArray() {
    return this.detalles.controls.map(
      (control: AbstractControl, index: number) => ({
        control: control as FormGroup,
        index,
      })
    );
  }

  guardar(): void {
    console.log(this.form.value);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;
    const detalles: DetalleDespacho[] = formValue.detalles.map((d: any) => ({
      idDetalleDespacho: d.idDetalleDespacho,
      cantidad: d.cantidad,
      producto: d.productoSeleccionado,
    }));

    const orden: OrdenRecepcion = {
      id_orden_recepcion: formValue.idOrdenRecepcion,
      fecha: formValue.fechaRecepcion,
      estado: formValue.estado,
      idProveedor: formValue.proveedor,
      detalleRecepcionDTOList: detalles,
    };

    const obs = this.editMode
      ? this.ordenRecepcionService.editar(orden.id_orden_recepcion!, orden)
      : this.ordenRecepcionService.crear(orden);

    obs.subscribe({
      next: () => this.router.navigate(["/dashboard/ordenesRecepcion"]),
      error: (err: any) => console.error("Error al guardar orden:", err),
    });
  }

  cancelar(): void {
    this.router.navigate(["/dashboard/ordenesRecepcion"]);
  }

  // Métodos para el modal de crear producto
  abrirModalProducto(detalleIndex: number = this.detalles.length - 1) {
    this.activeDetalleIndex = detalleIndex;
    this.showProductModal = true;
    this.productForm = this.formFactory.group({
      nombre: ['', Validators.required],
      codigoSku: ['', Validators.required],
      descripcion: [''],
      precio: [0, [Validators.required, Validators.min(0)]],
    });
  }

  cerrarModalProducto() {
    this.showProductModal = false;
  }

  confirmarCrearProducto() {
    if (this.productForm.valid) {
      const nuevoProducto = this.productForm.value;
      nuevoProducto.unidad_medida = 'unidad'; // Asignar una unidad de medida por defecto
      console.log('Crear producto:', nuevoProducto);
      
      // Crear el producto
      this.productoService.crear(nuevoProducto).subscribe({
        next: (productoCreado) => {
          console.log('Producto creado exitosamente:', productoCreado);
          this.cerrarModalProducto();
          
          // Buscar el producto recién creado por su código SKU y seleccionarlo
          this.buscarYSeleccionarProductoCreado(nuevoProducto.codigoSku);
        },
        error: (err) => {
          console.error('Error al crear producto:', err);
          alert('Error al crear el producto. Por favor, inténtalo de nuevo.');
        }
      });
    } else {
      this.productForm.markAllAsTouched();
    }
  }

  private buscarYSeleccionarProductoCreado(codigoSku: string) {
    // Buscar el producto por código SKU
    this.productoService.buscarPorNombreOCodigo(codigoSku).subscribe({
      next: (productos: Producto[]) => {
        const productoEncontrado = productos.find(p => 
          p.codigoSku.toLowerCase() === codigoSku.toLowerCase()
        );
        
        if (productoEncontrado) {
          // Seleccionar el producto en el detalle activo
          this.seleccionarProducto(this.activeDetalleIndex, productoEncontrado);
          console.log(`Producto ${productoEncontrado.nombre} seleccionado automáticamente`);
        } else {
          console.warn('No se pudo encontrar el producto recién creado');
        }
      },
      error: (err) => {
        console.error('Error al buscar el producto recién creado:', err);
      }
    });
  }

  // Métodos para el modal de crear proveedor
  abrirModalProveedor() {
    this.showProveedorModal = true;
    this.proveedorForm = this.formFactory.group({
      nombre: ['', Validators.required],
      telefono: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  cerrarModalProveedor() {
    this.showProveedorModal = false;
  }

  confirmarCrearProveedor() {
    if (this.proveedorForm.valid) {
      const nuevoProveedor = this.proveedorForm.value;
      console.log('Crear proveedor:', nuevoProveedor);
      
      // Crear el proveedor
      this.proveedoresService.crear(nuevoProveedor).subscribe({
        next: (proveedorCreado) => {
          console.log('Proveedor creado exitosamente:', proveedorCreado);
          this.cerrarModalProveedor();
          
          // Seleccionar automáticamente el proveedor recién creado
          this.buscarYSeleccionarProveedorCreado(proveedorCreado.id_proveedor!);
        },
        error: (err) => {
          console.error('Error al crear proveedor:', err);
          alert('Error al crear el proveedor. Por favor, inténtalo de nuevo.');
        }
      });
    } else {
      this.proveedorForm.markAllAsTouched();
    }
  }

  private buscarProveedorPorId(id: number) {
    return this.proveedoresService.buscarPorId(id).pipe(
      switchMap((proveedor: Proveedor) => {
        if (proveedor) {
          this.proveedorSeleccionado = proveedor;
          console.log(`Proveedor encontrado: ${proveedor.nombre}`);
        } else {
          this.proveedorSeleccionado = null;
          console.warn(`No se encontró el proveedor con ID: ${id}`);
        }
        return of(proveedor);
      })
    );
  }

  private buscarYSeleccionarProveedorCreado(idProveedor: number) {
    // Buscar el proveedor por ID
    this.proveedoresService.buscarPorId(idProveedor).subscribe({
      next: (proveedorEncontrado: Proveedor) => {
        if (proveedorEncontrado) {
          // Seleccionar el proveedor en el formulario principal
          this.form.patchValue({
            idProveedor: proveedorEncontrado.id_proveedor
          });
          console.log(`Proveedor ${proveedorEncontrado.nombre} seleccionado automáticamente`);
        } else {
          console.warn('No se pudo encontrar el proveedor recién creado');
        }
      },
      error: (err) => {
        console.error('Error al buscar el proveedor recién creado:', err);
      }
    });
  }
}
