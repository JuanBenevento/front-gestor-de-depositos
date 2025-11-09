import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormsModule, FormArray, AbstractControl } from "@angular/forms";
import { OrdenDespachoService } from "../../../core/services/orden-despacho.service";
import { DetalleDespachoService } from "../../../core/services/detalle-despacho.service";
import { ProductoService } from "../../../core/services/producto.service";
import { ClienteService } from "../../../core/services/cliente.service";
import { HttpClient } from "@angular/common/http";
import { Router, ActivatedRoute, RouterModule } from "@angular/router";
import { EstadoDeOrden } from "../../../core/enums/estados-de-orden.model";
import { DetalleDespacho } from "../../../core/models/orden-despacho/detalle-despacho.model";
import { Producto } from "../../../core/models/Producto/producto.model";
import OrdenDespacho from "../../../core/models/orden-despacho/orden-despacho.model";


@Component({
  selector: 'app-ordenes-despacho-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule], 
  templateUrl: `./gestion-ordenes-despacho-form.component.html`
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
    private productoService: ProductoService,
    private clienteService: ClienteService,
    private http: HttpClient, 
    private route: ActivatedRoute,
    private router: Router
  ) { 
    if (!this.route.snapshot) {
      this.route.snapshot = { paramMap: { get: (key: string) => null } } as any;
    }
  }

  ngOnInit(): void {
    this.form = this.fb.nonNullable.group({
      idOrdenDespacho: [0],
      fechaDespacho: ['', Validators.required],
      estado: [EstadoDeOrden.PENDIENTE, Validators.required], 
      cliente: this.fb.group({
        idCliente: [null, Validators.required],
        nombre: ['']
      }),
      detalles: this.fb.array([])
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editMode = true;
      this.idOrden = +id;
      
      this.ordenDespachoService.buscarPorId(this.idOrden).subscribe((data: OrdenDespacho) => {
        const dataToPatch = {
            ...data,
            fechaDespacho: data.fechaDespacho ? new Date(data.fechaDespacho).toISOString().split('T')[0] : '',
        };
        this.form.patchValue(dataToPatch as any); 
        
        this.detalles.clear();
        (data.detalles || []).forEach((d: DetalleDespacho) => this.agregarDetalle(d));
      });
    } else {
      this.agregarDetalle();
    }
  }

  get detalles(): FormArray {
    return this.form.get('detalles') as FormArray;
  }

  agregarDetalle(detalle?: DetalleDespacho) {
    const grupo = this.fb.group({
      idDetalleDespacho: [detalle?.idDetalleDespacho || null],
      nombreProducto: [detalle?.producto?.nombre || '', Validators.required],
      cantidad: [detalle?.cantidad || 1, [Validators.required, Validators.min(1)]]
    });
    this.detalles.push(grupo);
  }

  eliminarDetalle(index: number) {
    this.detalles.removeAt(index);
  }

  get detallesArray() {
    return this.detalles.controls.map((control: AbstractControl, index: number) => ({ control: control as FormGroup, index }));
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;
    
    const detalles: DetalleDespacho[] = formValue.detalles.map((d: any) => ({
      idDetalleDespacho: d.idDetalleDespacho,
      cantidad: d.cantidad,
      producto: { 
          nombre: d.nombreProducto, 
          idProducto: 0, 
      } as Producto
    }));


    const orden: OrdenDespacho = {
      idOrdenDespacho: formValue.idOrdenDespacho,
      fechaDespacho: formValue.fechaDespacho,
      estado: formValue.estado,
      cliente: formValue.cliente,
      detalles: detalles
    };

    const obs = this.editMode
      ? this.ordenDespachoService.actualizar(orden.idOrdenDespacho!, orden)
      : this.ordenDespachoService.crear(orden);

    obs.subscribe({
      next: () => this.router.navigate(['/dashboard/ordenesDespacho']),
      error: (err: any) => {
        console.error('Error al guardar orden:', err);
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/ordenesDespacho']);
  }
}