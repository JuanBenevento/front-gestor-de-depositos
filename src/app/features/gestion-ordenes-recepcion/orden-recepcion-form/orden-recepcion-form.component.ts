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
import { DetalleDespacho } from '../../../core/models/orden-despacho/detalle-despacho.model';
import { Producto } from '../../../core/models/Producto/producto.model';
import OrdenRecepcion from '../../../core/models/orden-recepcion/orden-recepcion.model';
import { DetalleRecepcion } from '../../../core/models/orden-recepcion/detalle-recepcion.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-orden-recepcion-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './orden-recepcion-form.component.html',
  styleUrl: './orden-recepcion-form.component.css'
})
export class OrdenRecepcionFormComponent implements OnInit {
  public EstadoDeOrden = EstadoDeOrden;
  form!: FormGroup;
  editMode = false;
  idOrden = 0;

  constructor(
    private formFactory: FormBuilder,
    private ordenRecepcionService: OrdenRecepcionService,
    private detalleOrdenRecepcionService: DetalleOrdenRecepcionService,
    private inventarioService: InventarioService,
    private productoService: ProductoService,
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

              console.log('valor:', valor);
              console.log('productos:', productos);

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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const detallesInvalidos = this.detalles.controls.some(
      (c) => c.value.cantidad > c.value.stockDisponible
    );
    if (detallesInvalidos) {
      alert("La cantidad solicitada supera el stock disponible.");
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
}
