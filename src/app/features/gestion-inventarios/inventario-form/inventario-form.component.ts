import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { debounceTime, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { InventarioService } from '../../../core/services/inventario.service';
import { ProductoService } from '../../../core/services/producto.service';
import { UbicacionService } from '../../../core/services/ubicacion.service';
import { ModalService } from '../../../shared/services/modal.service';

import { Producto } from '../../../core/models/Producto/producto.model';
import { Inventario } from '../../../core/models/inventario/inventario.model';
import { Ubicacion } from '../../../core/models/ubicacion/ubicacion.model';

@Component({
  selector: 'app-inventario-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './inventario-form.component.html',
  styleUrls: ['./inventario-form.component.css']
})
export class InventarioFormComponent implements OnInit {

  form!: FormGroup;
  editMode = false;
  idInventario = 0;

  // Listas
  productosAutocomplete: Producto[] = [];
  todasLasUbicaciones: Ubicacion[] = []; // Lista maestra
  ubicacionesFiltradas: Ubicacion[] = []; // Lista filtrada por categoría

  // Estados
  capacidadMaxima = 0;
  ocupadoActual = 0;
  capacidadDisponible = 0;
  productoSeleccionado: Producto | null = null;

  constructor(
    private fb: FormBuilder,
    private service: InventarioService,
    private productoService: ProductoService,
    private ubicacionService: UbicacionService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.cargarUbicaciones(); // Carga inicial de todas
    this.setupAutocomplete();

    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.editMode = true;
      this.idInventario = +id;
      this.cargarInventario(this.idInventario);
    }

    // Listener: Cambio de ubicación -> Calcular capacidad
    this.form.get("ubicacion.idUbicacion")?.valueChanges.subscribe(idUb => {
      this.actualizarDatosUbicacion(idUb);
    });

    // Listener: Cambio de cantidad -> Validar
    this.form.get("cantidad")?.valueChanges.subscribe(() => this.calcularCapacidad());
  }

  private initForm() {
    this.form = this.fb.group({
      productoInput: [''], 
      producto: this.fb.group({
        idProducto: [null, Validators.required]
      }),
      ubicacion: this.fb.group({
        idUbicacion: [null, Validators.required]
      }),
      cantidad: [1, [Validators.required, Validators.min(1)]]
    });
  }

  // ============================
  //  CARGA DE DATOS
  // ============================

  cargarUbicaciones() {
    this.ubicacionService.listar().subscribe({
      next: (data) => {
        this.todasLasUbicaciones = data;
        // Si no hay producto seleccionado, no mostramos ubicaciones o mostramos todas (decisión de diseño)
        // Aquí optamos por mostrar vacío hasta elegir producto para forzar el flujo correcto.
        this.ubicacionesFiltradas = []; 
      },
      error: () => this.showModal('Error al cargar ubicaciones', 'Error')
    });
  }

  cargarInventario(id: number) {
    this.service.buscarPorId(id).subscribe((inv: Inventario) => {
      // 1. Setear producto seleccionado para activar filtros
      this.productoSeleccionado = inv.producto as Producto;
      
      // 2. Filtrar ubicaciones válidas para esa categoría
      this.filtrarUbicacionesPorCategoria(this.productoSeleccionado);

      // 3. Llenar formulario
      this.form.patchValue({
        productoInput: `${inv.producto.nombre} (${inv.producto.codigoSku})`,
        producto: { idProducto: inv.producto.idProducto },
        ubicacion: { idUbicacion: inv.ubicacion.idUbicacion },
        cantidad: inv.cantidad
      });
    });
  }

  // ============================
  //  LÓGICA DE CATEGORÍAS (NUEVO)
  // ============================

  seleccionarProducto(producto: Producto) {
    this.productoSeleccionado = producto;
    
    this.form.patchValue({
      productoInput: `${producto.nombre} (${producto.codigoSku})`,
      producto: { idProducto: producto.idProducto }
    });
    
    // Resetear ubicación al cambiar de producto (porque las válidas cambian)
    this.form.get('ubicacion.idUbicacion')?.setValue(null);
    
    this.filtrarUbicacionesPorCategoria(producto);
    this.productosAutocomplete = [];
  }

  filtrarUbicacionesPorCategoria(producto: Producto) {
    if (!producto || !producto.categoria) {
        this.ubicacionesFiltradas = [];
        return;
    }

    const cat = producto.categoria; // Ej: "FERRETERIA"

    // Filtramos las ubicaciones donde la ZONA admita esa categoría
    this.ubicacionesFiltradas = this.todasLasUbicaciones.filter(u => 
        u.zona && u.zona.categoriasAdmitidas && u.zona.categoriasAdmitidas.includes(cat)
    );

    if (this.ubicacionesFiltradas.length === 0) {
        this.showModal(`No hay ubicaciones configuradas para recibir la categoría: ${cat}`, 'Atención');
    }
  }

  // ============================
  //  AUTOCOMPLETE
  // ============================

  setupAutocomplete() {
    this.form.get("productoInput")?.valueChanges
      .pipe(
        debounceTime(400),
        switchMap(valor => {
          if (!valor || valor.trim() === "") return of([]);
          return this.productoService.buscarPorNombreOCodigo(valor);
        })
      )
      .subscribe((productos: Producto[]) => {
        this.productosAutocomplete = productos;
      });
  }

  // ============================
  //  VALIDACIONES
  // ============================

  actualizarDatosUbicacion(idUbicacion: number) {
    const ub = this.todasLasUbicaciones.find(u => u.idUbicacion === idUbicacion);
    if (ub) {
      this.capacidadMaxima = ub.capacidadMaxima;
      this.ocupadoActual = ub.ocupadoActual;
      this.calcularCapacidad();
    }
  }

  calcularCapacidad() {
    const cantidad = this.form.get("cantidad")?.value || 0;
    
    // Si estamos editando, liberamos "nuestro" espacio actual virtualmente para recalcular
    // Pero para simplificar, usamos la lógica estándar: Espacio Libre Real.
    this.capacidadDisponible = this.capacidadMaxima - this.ocupadoActual;

    if (cantidad > this.capacidadDisponible) {
      this.form.get("cantidad")?.setErrors({ capacidad: true });
    } else {
        // Si tenía error de capacidad y ahora está bien, limpiamos ESE error específico
        if (this.form.get("cantidad")?.hasError('capacidad')) {
            this.form.get("cantidad")?.setErrors(null);
        }
    }
  }

  // ============================
  //  GUARDAR
  // ============================

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dto = {
      producto: { idProducto: this.form.value.producto.idProducto },
      ubicacion: { idUbicacion: this.form.value.ubicacion.idUbicacion },
      cantidad: this.form.value.cantidad
    };

    const obs = this.editMode
      ? this.service.actualizar(this.idInventario, dto)
      : this.service.crear(dto);

    obs.subscribe({
      next: () => {
        this.showModal('Inventario guardado correctamente.', 'Éxito', () => {
            this.router.navigate(['/dashboard/inventarios']);
        });
      },
      error: (err) => {
        console.error(err);
        const msg = err.error && typeof err.error === 'string' ? err.error : 'Error al guardar.';
        this.showModal(msg, 'Error');
      }
    });
  }

  cancelar() {
    this.router.navigate(['/dashboard/inventarios']);
  }

  private showModal(message: string, title: string, onConfirm?: () => void): void {
    this.modalService.open({ title, message, confirmText: 'Aceptar', onConfirm });
  }
}