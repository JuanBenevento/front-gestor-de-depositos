import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { debounceTime, switchMap, filter, map } from 'rxjs/operators';
import { of } from 'rxjs';

// SERVICIOS
import { MovimientosInventarioService } from '../../../core/services/movimientos-inventario.service';
import { ProductoService } from '../../../core/services/producto.service';
import { UbicacionService } from '../../../core/services/ubicacion.service';
import { InventarioService } from '../../../core/services/inventario.service';
import { ModalService } from '../../../shared/services/modal.service';

// MODELOS
import { Producto } from '../../../core/models/Producto/producto.model';
import { Ubicacion } from '../../../core/models/ubicacion/ubicacion.model';
import { MovimientoInventarioEstado, MOVIMIENTO_INVENTARIO_ESTADOS } from '../../../core/enums/movimiento-inventario-estado.model';

// COMPONENTES
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-movimientos-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './movimientos-form.html',
  styleUrl: './movimiento-form.css' 
})
export class MovimientosForm implements OnInit {

  form!: FormGroup;
  editMode = false;
  saving = false;
  maxDate: string = '';
  
  estados = MOVIMIENTO_INVENTARIO_ESTADOS;

  // AUTOCOMPLETE LISTS
  productosFiltrados: Producto[] = [];
  ubicacionesOrigenFiltradas: Ubicacion[] = [];
  ubicacionesDestinoFiltradas: Ubicacion[] = [];

  // DROPDOWNS STATES
  showProdDropdown = false;
  showOrigDropdown = false;
  showDestDropdown = false;

  // SELECCIONES
  productoSeleccionado: Producto | null = null;
  ubicacionOrigen: Ubicacion | null = null;
  ubicacionDestino: Ubicacion | null = null;

  // DATOS DE INVENTARIO
  stockEnOrigen = 0;
  capacidadEnDestino = 0;
  ocupadoEnDestino = 0;

  constructor(
    private fb: FormBuilder,
    private movimientosService: MovimientosInventarioService,
    private productoService: ProductoService,
    private ubicacionService: UbicacionService,
    private inventarioService: InventarioService,
    private modalService: ModalService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.maxDate = new Date().toISOString().split('T')[0];
    this.initForm();
    this.setupListeners();
  }

  private initForm() {
    this.form = this.fb.group({
      idMovimientoInventario: [0],
      
      // Producto
      inputProducto: ['', Validators.required],
      
      // Ubicaciones (Inputs de texto para búsqueda)
      inputOrigen: ['', Validators.required],
      inputDestino: ['', Validators.required],

      cantidad: [1, [Validators.required, Validators.min(1)]],
      estado: [MovimientoInventarioEstado.REUBICACION, Validators.required],
      fecha: [this.maxDate, [Validators.required, this.validarFechaNoFutura()]]
    });
  }

  // --- LISTENERS & BÚSQUEDAS ---

  setupListeners() {
    // 1. Producto
    this.form.get('inputProducto')?.valueChanges.pipe(
      debounceTime(300),
      filter(val => typeof val === 'string'),
      switchMap(val => {
        if (!val || val.length < 2) {
            this.showProdDropdown = false;
            return of([]);
        }
        return this.productoService.buscarPorNombreOCodigo(val);
      })
    ).subscribe(data => {
      this.productosFiltrados = data;
      this.showProdDropdown = true;
    });

    // 2. Origen (Traer ubicaciones que tengan este producto si ya se seleccionó, sino todas)
    this.form.get('inputOrigen')?.valueChanges.pipe(
      debounceTime(300),
      switchMap(val => {
         if(!val) { this.showOrigDropdown = false; return of([]); }
         // Aquí podríamos optimizar buscando solo donde haya stock, por ahora buscamos por código
         return this.ubicacionService.listar().pipe(
             map(ubs => ubs.filter(u => u.codigo.toLowerCase().includes(val.toLowerCase())))
         );
      })
    ).subscribe(data => {
      this.ubicacionesOrigenFiltradas = data;
      this.showOrigDropdown = true;
    });

    // 3. Destino
    this.form.get('inputDestino')?.valueChanges.pipe(
      debounceTime(300),
      switchMap(val => {
         if(!val) { this.showDestDropdown = false; return of([]); }
         return this.ubicacionService.listar().pipe(
             map(ubs => ubs.filter(u => u.codigo.toLowerCase().includes(val.toLowerCase())))
         );
      })
    ).subscribe(data => {
      this.ubicacionesDestinoFiltradas = data;
      this.showDestDropdown = true;
    });
  }

  // --- SELECCIONES ---

  seleccionarProducto(p: Producto) {
    this.productoSeleccionado = p;
    this.form.patchValue({ inputProducto: `${p.nombre} (${p.codigoSku})` });
    this.showProdDropdown = false;
    
    // Resetear ubicaciones si cambian producto
    this.resetUbicaciones();
  }

  seleccionarOrigen(u: Ubicacion) {
    this.ubicacionOrigen = u;
    this.form.patchValue({ inputOrigen: u.codigo });
    this.showOrigDropdown = false;
    this.verificarStockOrigen();
  }

  seleccionarDestino(u: Ubicacion) {
    this.ubicacionDestino = u;
    this.form.patchValue({ inputDestino: u.codigo });
    this.showDestDropdown = false;
    this.verificarCapacidadDestino();
  }

  // --- VALIDACIONES DE NEGOCIO ---

  verificarStockOrigen() {
    if (this.productoSeleccionado && this.ubicacionOrigen) {
      // Buscamos inventario específico
      this.inventarioService.listar().subscribe(invs => {
         const item = invs.find(i => 
             i.producto.idProducto === this.productoSeleccionado?.idProducto && 
             i.ubicacion.idUbicacion === this.ubicacionOrigen?.idUbicacion
         );
         this.stockEnOrigen = item ? item.cantidad : 0;
         
         // Validar maximo en el input
         this.form.get('cantidad')?.setValidators([
             Validators.required, 
             Validators.min(1), 
             Validators.max(this.stockEnOrigen)
         ]);
         this.form.get('cantidad')?.updateValueAndValidity();
      });
    }
  }

  verificarCapacidadDestino() {
    if (this.ubicacionDestino) {
        this.capacidadEnDestino = this.ubicacionDestino.capacidadMaxima;
        this.ocupadoEnDestino = this.ubicacionDestino.ocupadoActual;
    }
  }

  // 💡 VALIDACIÓN DE CATEGORÍA
  esCategoriaValida(): boolean {
    if (!this.productoSeleccionado || !this.ubicacionDestino) return true; // No validar si falta data
    
    const zona = this.ubicacionDestino.zona;
    const catProducto = this.productoSeleccionado.categoria;

    // Si la zona no tiene lista de categorías o la categoría del producto no está en la lista
    if (zona.categoriasAdmitidas && !zona.categoriasAdmitidas.includes(catProducto)) {
        return false;
    }
    return true;
  }

  resetUbicaciones() {
      this.ubicacionOrigen = null;
      this.ubicacionDestino = null;
      this.stockEnOrigen = 0;
      this.form.patchValue({ inputOrigen: '', inputDestino: '', cantidad: 1 });
  }

  // --- UTILS ---
  validarFechaNoFutura(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const fecha = new Date(control.value);
      fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset());
      fecha.setHours(0,0,0,0);
      return fecha > new Date() ? { fechaFutura: true } : null;
    };
  }

  cerrarDropdowns() {
      setTimeout(() => {
        this.showProdDropdown = false;
        this.showOrigDropdown = false;
        this.showDestDropdown = false;
      }, 200);
  }

  // --- GUARDAR ---

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.modalService.open({ title: 'Datos Incompletos', message: 'Verifique los campos requeridos.', confirmText: 'Ok' });
      return;
    }

    if (!this.esCategoriaValida()) {
       this.modalService.open({ 
           title: 'Error de Categoría', 
           message: `La zona '${this.ubicacionDestino?.zona.nombre}' no admite productos de categoría '${this.productoSeleccionado?.categoria}'.`, 
           confirmText: 'Entendido' 
       });
       return;
    }

    this.saving = true;
    const raw = this.form.value;

    const payload = {
      producto: this.productoSeleccionado,
      ubicacionOrigen: this.ubicacionOrigen,
      ubicacionDestino: this.ubicacionDestino,
      cantidad: Number(raw.cantidad),
      estado: raw.estado,
      fecha: new Date(raw.fecha)
    };

    this.movimientosService.crear(payload).subscribe({
      next: () => {
        this.saving = false;
        this.modalService.open({ title: 'Éxito', message: 'Movimiento registrado.', confirmText: 'Ok', onConfirm: () => this.cancelar() });
      },
      error: (err) => {
        this.saving = false;
        console.error(err);
        this.modalService.open({ title: 'Error', message: 'No se pudo registrar el movimiento.', confirmText: 'Ok' });
      }
    });
  }

  cancelar() {
    this.router.navigate(['/dashboard/movimientosInventario']);
  }
}