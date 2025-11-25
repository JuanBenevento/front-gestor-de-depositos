import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { debounceTime, switchMap, filter, tap } from 'rxjs/operators';
import { of } from 'rxjs';

// SERVICIOS
import { OrdenRecepcionService } from '../../../core/services/orden-recepcion.service';
import { DetalleOrdenRecepcionService } from '../../../core/services/detalle-orden-recepcion.service';
import { ProductoService } from '../../../core/services/producto.service';
import { ProveedoresService } from '../../../core/services/proveedores.service';
import { InventarioService } from '../../../core/services/inventario.service';
import { ModalService } from '../../../shared/services/modal.service';

// MODELOS Y ENUMS
import { EstadoDeOrden } from '../../../core/enums/estados-de-orden.model';
import { Proveedor } from '../../../core/models/proveedor/proveedor.model';
import { Producto} from '../../../core/models/Producto/producto.model';
import OrdenRecepcion from '../../../core/models/orden-recepcion/orden-recepcion.model'; // Usamos tu import default
import { DetalleRecepcionDTO } from '../../../core/models/orden-recepcion/detalle-recepcion.model';

// COMPONENTES
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { CategoriasProducto } from '../../../core/enums/categoriasProductos.model';

@Component({
  selector: 'app-orden-recepcion-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent, RouterModule],
  templateUrl: './orden-recepcion-form.component.html',
  styleUrl: './orden-recepcion-form.component.css'
})
export class OrdenRecepcionFormComponent implements OnInit {
  
  public EstadoDeOrden = EstadoDeOrden;
  form!: FormGroup;
  editMode = false;
  idOrden = 0;
  saving = false;

  // FECHA
  maxDate: string = '';

  // PROVEEDORES
  proveedores: Proveedor[] = [];
  proveedoresFiltrados: Proveedor[] = [];
  proveedorSeleccionado: Proveedor | null = null;
  showProveedorDropdown = false;

  showProductModal = false;
  productForm!: FormGroup;
  activeDetalleIndex = 0;
  categoriasOpciones = Object.values(CategoriasProducto);

  showProveedorModal = false;
  proveedorForm!: FormGroup;

  constructor(
    private formFactory: FormBuilder,
    private ordenRecepcionService: OrdenRecepcionService,
    private detalleOrdenRecepcionService: DetalleOrdenRecepcionService,
    private productoService: ProductoService,
    private proveedoresService: ProveedoresService,
    private inventarioService: InventarioService,
    private modalService: ModalService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.maxDate = new Date().toISOString().split('T')[0];
    this.initForm();
    this.cargarProveedores(); 

    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.editMode = true;
      this.idOrden = +id;
      this.cargarOrdenExistente(this.idOrden);
    } else {
      this.agregarDetalle(); 
    }

    this.form.get('inputProveedor')?.valueChanges.subscribe(valor => {
      this.filtrarProveedores(valor);
    });
  }

  private initForm() {
    this.form = this.formFactory.group({
      idOrdenRecepcion: [0],
      inputProveedor: [''], 
      idProveedor: [null, Validators.required], 
      fecha: [this.maxDate, [Validators.required, this.validarFechaNoFutura()]],
      estado: [EstadoDeOrden.PENDIENTE, Validators.required],
      detalles: this.formFactory.array([]),
    });
  }

  validarFechaNoFutura(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const fechaIngresada = new Date(control.value);
      fechaIngresada.setMinutes(fechaIngresada.getMinutes() + fechaIngresada.getTimezoneOffset());
      fechaIngresada.setHours(0, 0, 0, 0);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      return fechaIngresada > hoy ? { fechaFutura: true } : null;
    };
  }

  cargarProveedores() {
    this.proveedoresService.listar().subscribe(data => {
      this.proveedores = data;
    });
  }

  filtrarProveedores(termino: string) {
    if (!termino) {
      this.proveedoresFiltrados = [];
      this.showProveedorDropdown = false;
      return;
    }
    const term = termino.toLowerCase();
    this.proveedoresFiltrados = this.proveedores.filter(p => 
      p.nombre.toLowerCase().includes(term) || 
      p.email.toLowerCase().includes(term)
    );
    this.showProveedorDropdown = true;
  }

  seleccionarProveedor(proveedor: Proveedor) {
    this.proveedorSeleccionado = proveedor;
    this.form.patchValue({
      idProveedor: proveedor.id_proveedor,
      inputProveedor: '' 
    });
    this.showProveedorDropdown = false;
  }

  quitarProveedor() {
    this.proveedorSeleccionado = null;
    this.form.patchValue({ idProveedor: null, inputProveedor: '' });
  }

  get detalles(): FormArray {
    return this.form.get("detalles") as FormArray;
  }

  agregarDetalle(dto?: DetalleRecepcionDTO) {
    const grupo = this.formFactory.group({
      idDetalleRecepcion: [dto?.idDetalleRecepcion || null],
      inputProducto: [dto?.producto?.nombre || "", Validators.required],
      productoSeleccionado: [dto?.producto || null, Validators.required],
      cantidad: [dto?.cantidad || 1, [Validators.required, Validators.min(1)]],
      filteredProducts: [[] as Producto[]],
      showDropdown: [false]
    });

    grupo.get("inputProducto")?.valueChanges.pipe(
      debounceTime(300),
      filter(val => typeof val === 'string'), 
      switchMap(val => {
        if (!val || val.length < 2) {
            grupo.patchValue({ filteredProducts: [], showDropdown: false }, { emitEvent: false });
            return of([]);
        }
        return this.productoService.buscarPorNombreOCodigo(val);
      })
    ).subscribe(productos => {
      grupo.patchValue({ filteredProducts: productos, showDropdown: true }, { emitEvent: false });
    });

    this.detalles.push(grupo);
  }

  seleccionarProducto(index: number, producto: Producto) {
    const control = this.detalles.at(index);
    control.patchValue({
      productoSeleccionado: producto,
      inputProducto: `${producto.nombre} (${producto.codigoSku})`,
      showDropdown: false,
      filteredProducts: []
    }, { emitEvent: false }); 
  }

  cerrarDropdownProducto(index: number) {
    setTimeout(() => {
        const control = this.detalles.at(index);
        control.patchValue({ showDropdown: false });
    }, 200);
  }

  eliminarDetalle(index: number) {
    this.detalles.removeAt(index);
  }

  cargarOrdenExistente(id: number) {
    this.ordenRecepcionService.buscarPorId(id).subscribe(orden => {
      this.proveedorSeleccionado = orden.proveedor || null;
      this.form.patchValue({
        idOrdenRecepcion: orden.id_orden_recepcion,
        fecha: new Date(orden.fecha).toISOString().split('T')[0],
        estado: orden.estado,
        idProveedor: orden.proveedor?.id_proveedor
      });

      if (orden.detalleRecepcionDTOList) {
        this.detalles.clear();
        orden.detalleRecepcionDTOList.forEach(d => this.agregarDetalle(d));
      }
    });
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.modalService.open({ title: 'Error', message: 'Verifique los campos.', confirmText: 'Ok' });
      return;
    }

    this.saving = true;
    const formValue = this.form.value;
    
    // Construcción del objeto OrdenRecepcion (DTO para backend)
    const dtoBackend: OrdenRecepcion = {
        id_orden_recepcion: this.idOrden || undefined,
        proveedor: { id_proveedor: formValue.idProveedor } as any, // Solo necesitamos ID
        fecha: formValue.fecha,
        estado: formValue.estado,
        detalleRecepcionDTOList: formValue.detalles.map((d: any) => ({
            idDetalleRecepcion: d.idDetalleRecepcion, // Enviamos ID si existe (aunque el back lo borrará y recreará)
            cantidad: d.cantidad,
            producto: d.productoSeleccionado,
            codigoSku: d.productoSeleccionado.codigoSku
        }))
    };

    const obs = this.editMode
      ? this.ordenRecepcionService.editar(this.idOrden, dtoBackend) // 💡 Ahora pasamos todo el objeto
      : this.ordenRecepcionService.crear(dtoBackend); 

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.modalService.open({ 
            title: 'Éxito', 
            message: this.editMode ? 'Orden actualizada y stock ajustado.' : 'Orden creada.', 
            confirmText: 'Ok', 
            onConfirm: () => this.router.navigate(['/dashboard/ordenesRecepcion']) 
        });
      },
      error: (err) => {
        this.saving = false;
        console.error(err);
        let msg = 'Error desconocido.';
        if (err.error && typeof err.error === 'string') msg = err.error;
        else if (err.error?.message) msg = err.error.message;
        
        this.modalService.open({ title: 'Error al Guardar', message: msg, confirmText: 'Cerrar' });
      }
    });
  }

  abrirModalProducto(index: number) {
      this.activeDetalleIndex = index;
      this.showProductModal = true;
      this.productForm = this.formFactory.group({
          nombre: ['', Validators.required],
          codigoSku: ['', Validators.required],
          categoria: [null, Validators.required],
          unidad_medida: ['', Validators.required],
          descripcion: ['']
      });
  }
  
  cerrarModalProducto() { this.showProductModal = false; }
  
  confirmarCrearProducto() {
      if(this.productForm.valid) {
          this.productoService.crear(this.productForm.value).subscribe({
              next: (prod) => {
                  this.seleccionarProducto(this.activeDetalleIndex, prod);
                  this.cerrarModalProducto();
                  this.modalService.open({ title: 'Éxito', message: 'Producto creado.', confirmText: 'Ok' });
              },
              error: (err) => {
                  let msg = 'Error al crear.';
                  if (err.status === 400) msg = typeof err.error === 'string' ? err.error : err.error.message;
                  this.modalService.open({ title: 'Error Validación', message: msg, confirmText: 'Ok' });
              }
          })
      } else {
          this.productForm.markAllAsTouched();
      }
  }

  abrirModalProveedor() {
    this.showProveedorModal = true;
    this.proveedorForm = this.formFactory.group({
      nombre: ['', Validators.required],
      telefono: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  cerrarModalProveedor() { this.showProveedorModal = false; }

  confirmarCrearProveedor() {
    if (this.proveedorForm.valid) {
      this.proveedoresService.crear(this.proveedorForm.value).subscribe({
        next: (prov) => {
          this.cargarProveedores();
          this.seleccionarProveedor(prov);
          this.cerrarModalProveedor();
        },
        error: () => this.modalService.open({ title: 'Error', message: 'Error al crear proveedor.', confirmText: 'Ok' })
      });
    } else {
      this.proveedorForm.markAllAsTouched();
    }
  }

  asFormGroup(abstractControl: AbstractControl): FormGroup {
    return abstractControl as FormGroup;
  }

  cancelar() {
    this.router.navigate(['/dashboard/ordenesRecepcion']);
  }
}