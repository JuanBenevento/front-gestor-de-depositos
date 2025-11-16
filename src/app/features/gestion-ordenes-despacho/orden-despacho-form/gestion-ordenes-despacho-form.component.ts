import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
  FormsModule,
  FormArray,
  AbstractControl,
} from "@angular/forms";
import { OrdenDespachoService } from "../../../core/services/orden-despacho.service";
import { DetalleDespachoService } from "../../../core/services/detalle-despacho.service";
import { ProductoService } from "../../../core/services/producto.service";
import { ClienteService } from "../../../core/services/cliente.service";
import { InventarioService } from "../../../core/services/inventario.service";
import { HttpClient } from "@angular/common/http";
import { Router, ActivatedRoute, RouterModule } from "@angular/router";
import { EstadoDeOrden } from "../../../core/enums/estados-de-orden.model";
import { DetalleDespacho } from "../../../core/models/orden-despacho/detalle-despacho.model";
import { Producto } from "../../../core/models/Producto/producto.model";
import OrdenDespacho from "../../../core/models/orden-despacho/orden-despacho.model";
import {
  debounceTime,
  switchMap,
  filter,
  catchError,
  tap,
} from "rxjs/operators";
import { of } from "rxjs";

@Component({
  selector: "app-ordenes-despacho-form",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: `./gestion-ordenes-despacho-form.component.html`,
})
export class OrdenesDespachoForm implements OnInit {
  public EstadoDeOrden = EstadoDeOrden;
  form!: FormGroup;
  editMode = false;
  idOrden = 0;

  constructor(
    private fb: FormBuilder,
    private ordenDespachoService: OrdenDespachoService,
    private detalleDespachoService: DetalleDespachoService,
    private inventarioService: InventarioService,
    private productoService: ProductoService,
    private clienteService: ClienteService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.nonNullable.group({
      idOrdenDespacho: [0],
      fechaDespacho: ["", Validators.required],
      estado: [EstadoDeOrden.PENDIENTE, Validators.required],
      cliente: this.fb.group({
        idCliente: [null, Validators.required],
        nombre: [""],
      }),
      detalles: this.fb.array([]),
    });

    this.form
      .get("cliente.idCliente")
      ?.valueChanges.pipe(
        debounceTime(400),
        switchMap((id) => {
          const numericId = Number(id);

          if (!numericId || isNaN(numericId)) {
            return of(null);
          }

          return this.clienteService.buscarPorId(numericId).pipe(
            catchError((err) => {
              console.warn("ERROR capturado al buscar cliente:", err);
              return of(null);
            })
          );
        }),
        tap((cliente) => {
          if (cliente) {
            this.form.patchValue(
              { cliente: { nombre: cliente.nombre } },
              { emitEvent: false }
            );
          } else {
            this.form.patchValue(
              { cliente: { nombre: "" } },
              { emitEvent: false }
            );
          }
        })
      )
      .subscribe();

    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.editMode = true;
      this.idOrden = +id;
      this.ordenDespachoService
        .buscarPorId(this.idOrden)
        .subscribe((data: OrdenDespacho) => {
          const dataToPatch = {
            ...data,
            fechaDespacho: data.fechaDespacho
              ? new Date(data.fechaDespacho).toISOString().split("T")[0]
              : "",
          };
          this.form.patchValue(dataToPatch as any);
          this.detalles.clear();
          (data.detalle_despacho || []).forEach((d: DetalleDespacho) =>
            this.agregarDetalle(d)
          );
        });
    } else {
      this.agregarDetalle();
    }
  }

  get detalles(): FormArray {
    return this.form.get("detalles") as FormArray;
  }

  agregarDetalle(detalle?: DetalleDespacho) {
    const grupo = this.fb.group({
      idDetalleDespacho: [detalle?.idDetalleDespacho || null],
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

    const orden: OrdenDespacho = {
      idOrdenDespacho: formValue.idOrdenDespacho,
      fechaDespacho: formValue.fechaDespacho,
      estado: formValue.estado,
      cliente: formValue.cliente,
      detalle_despacho: detalles,
    };

    const obs = this.editMode
      ? this.ordenDespachoService.actualizar(orden.idOrdenDespacho!, orden)
      : this.ordenDespachoService.crear(orden);

    obs.subscribe({
      next: () => this.router.navigate(["/dashboard/ordenesDespacho"]),
      error: (err: any) => console.error("Error al guardar orden:", err),
    });
  }

  cancelar(): void {
    this.router.navigate(["/dashboard/ordenesDespacho"]);
  }
}
