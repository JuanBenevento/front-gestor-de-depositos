import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormArray, AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { Router, ActivatedRoute, RouterModule } from "@angular/router";
import { debounceTime, switchMap, filter } from "rxjs/operators";
import { of } from "rxjs";

// SERVICIOS
import { OrdenDespachoService } from "../../../core/services/orden-despacho.service";
import { ProductoService } from "../../../core/services/producto.service";
import { ClienteService } from "../../../core/services/cliente.service";
import { InventarioService } from "../../../core/services/inventario.service";
import { ModalService } from "../../../shared/services/modal.service";

// MODELOS
import { EstadoDeOrden } from "../../../core/enums/estados-de-orden.model";
import { Cliente } from "../../../core/models/cliente/cliente.model";
import { Producto } from "../../../core/models/Producto/producto.model";
import OrdenDespacho from "../../../core/models/orden-despacho/orden-despacho.model";
import { DetalleDespacho } from "../../../core/models/orden-despacho/detalle-despacho.model";

// COMPONENTES
import { ModalComponent } from "../../../shared/components/modal/modal.component";

@Component({
  selector: "app-ordenes-despacho-form",
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, ModalComponent],
  templateUrl: `./gestion-ordenes-despacho-form.component.html`,
  styleUrl: './gestion-ordenes-despacho-form.component.css'
})
export class OrdenesDespachoForm implements OnInit {
  
  public EstadoDeOrden = EstadoDeOrden;
  form!: FormGroup;
  editMode = false;
  idOrden = 0;
  saving = false;
  maxDate: string = '';
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  clienteSeleccionado: Cliente | null = null;
  showClienteDropdown = false;

  showClienteModal = false;
  clienteForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private ordenDespachoService: OrdenDespachoService,
    private productoService: ProductoService,
    private clienteService: ClienteService,
    private inventarioService: InventarioService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.maxDate = new Date().toISOString().split('T')[0];
    this.initForm();
    this.cargarClientes(); 

    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.editMode = true;
      this.idOrden = +id;
      this.cargarOrdenExistente(this.idOrden);
    } else {
      this.agregarDetalle();
    }

    this.form.get('inputCliente')?.valueChanges.subscribe(val => this.filtrarClientes(val));
  }

  private initForm() {
    this.form = this.fb.group({
      idOrdenDespacho: [0],
      fechaDespacho: [this.maxDate, [Validators.required, this.validarFechaNoFutura()]],
      estado: [EstadoDeOrden.PENDIENTE, Validators.required],

      inputCliente: [''], 
      cliente: this.fb.group({
        idCliente: [null, Validators.required], 
        nombre: ['']
      }),
      
      detalles: this.fb.array([]),
    });
  }

  validarFechaNoFutura(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const fecha = new Date(control.value);
      fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset());
      fecha.setHours(0, 0, 0, 0);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      return fecha > hoy ? { fechaFutura: true } : null;
    };
  }

  cargarClientes() {
    this.clienteService.listar().subscribe(data => {
      this.clientes = data;
      this.clientesFiltrados = [];
    });
  }

  filtrarClientes(termino: string) {
    if (!termino) {
      this.clientesFiltrados = [];
      this.showClienteDropdown = false;
      return;
    }
    const term = termino.toLowerCase();
    this.clientesFiltrados = this.clientes.filter(c => 
      c.nombre.toLowerCase().includes(term) || 
      c.email.toLowerCase().includes(term)
    );
    this.showClienteDropdown = true;
  }

  seleccionarCliente(cliente: Cliente) {
    this.clienteSeleccionado = cliente;
    this.form.get('cliente')?.patchValue({
      idCliente: cliente.idCliente,
      nombre: cliente.nombre
    });
    this.form.patchValue({ inputCliente: '' });
    this.showClienteDropdown = false;
  }

  quitarCliente() {
    this.clienteSeleccionado = null;
    this.form.get('cliente')?.patchValue({ idCliente: null, nombre: '' });
    this.form.patchValue({ inputCliente: '' });
  }

  get detalles(): FormArray {
    return this.form.get("detalles") as FormArray;
  }

  asFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  agregarDetalle(detalle?: DetalleDespacho) {
    const grupo = this.fb.group({
      idDetalleDespacho: [detalle?.idDetalleDespacho || null],
      inputProducto: [detalle?.producto?.nombre || "", Validators.required],
      productoSeleccionado: [detalle?.producto || null, Validators.required],
      cantidad: [detalle?.cantidad || 1, [Validators.required, Validators.min(1)]],
      stockDisponible: [0], 
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

    if (detalle?.producto) {
       this.verificarStock(detalle.producto.codigoSku, grupo);
    }

    this.detalles.push(grupo);
  }

  seleccionarProducto(index: number, producto: Producto) {
    const control = this.detalles.at(index) as FormGroup;
    
    control.patchValue({
      productoSeleccionado: producto,
      inputProducto: `${producto.nombre} (${producto.codigoSku})`,
      showDropdown: false,
      filteredProducts: []
    }, { emitEvent: false });

    this.verificarStock(producto.codigoSku, control);
  }

  verificarStock(sku: string, control: FormGroup) {
    this.inventarioService.obtenerStockPorProductoPorCodigoSku(sku).subscribe(stock => {
      control.patchValue({ stockDisponible: stock });

      const cantidadControl = control.get('cantidad');
      cantidadControl?.setValidators([Validators.required, Validators.min(1), Validators.max(stock)]);
      cantidadControl?.updateValueAndValidity();
    });
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
    this.ordenDespachoService.buscarPorId(id).subscribe(orden => {
      this.clienteSeleccionado = orden.cliente || null;
      
      this.form.patchValue({
        idOrdenDespacho: orden.idOrdenDespacho,
        fechaDespacho: new Date(orden.fechaDespacho).toISOString().split('T')[0],
        estado: orden.estado,
        inputCliente: '',
        cliente: {
            idCliente: orden.cliente.idCliente,
            nombre: orden.cliente.nombre
        }
      });

      this.detalles.clear();
      if (orden.detalle_despacho) {
        orden.detalle_despacho.forEach(d => this.agregarDetalle(d));
      }
    });
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.modalService.open({ title: 'Error', message: 'Verifique stock insuficiente o campos vacíos.', confirmText: 'Ok' });
      return;
    }

    this.saving = true;
    const formValue = this.form.value;

    const orden: OrdenDespacho = {
      idOrdenDespacho: this.idOrden || undefined,
      fechaDespacho: formValue.fechaDespacho,
      estado: formValue.estado,
      cliente: { idCliente: formValue.cliente.idCliente } as Cliente,
      detalle_despacho: formValue.detalles.map((d: any) => ({
        idDetalleDespacho: d.idDetalleDespacho,
        producto: d.productoSeleccionado,
        cantidad: d.cantidad
      }))
    };

    const obs = this.editMode
      ? this.ordenDespachoService.actualizar(this.idOrden, orden)
      : this.ordenDespachoService.crear(orden);

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.modalService.open({ title: 'Éxito', message: 'Despacho registrado correctamente.', confirmText: 'Ok', onConfirm: () => this.cancelar() });
      },
      error: (err) => {
        this.saving = false;
        let msg = 'Error desconocido.';
        if (err.status === 409) msg = typeof err.error === 'string' ? err.error : err.error.message;
        else if (err.error && typeof err.error === 'string') msg = err.error;
        else if (err.error?.message) msg = err.error.message;
        this.modalService.open({ title: 'Error al Guardar', message: msg, confirmText: 'Cerrar' });
      }
    });
  }

  abrirModalCliente() {
    this.showClienteModal = true;
    this.clienteForm = this.fb.group({
      nombre: ['', Validators.required],
      telefono: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  cerrarModalCliente() { this.showClienteModal = false; }

  confirmarCrearCliente() {
    if (this.clienteForm.valid) {
      this.clienteService.crear(this.clienteForm.value).subscribe({
        next: (cli) => {
          this.cargarClientes(); 
          this.seleccionarCliente(cli); 
          this.cerrarModalCliente();
          this.modalService.open({ title: 'Éxito', message: 'Cliente creado.', confirmText: 'Ok' });
        },
        error: () => this.modalService.open({ title: 'Error', message: 'Error al crear cliente.', confirmText: 'Ok' })
      });
    } else {
      this.clienteForm.markAllAsTouched();
    }
  }

  cancelar() {
    this.router.navigate(["/dashboard/ordenesDespacho"]);
  }
}