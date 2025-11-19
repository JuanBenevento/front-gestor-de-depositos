import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormGroup
} from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { debounceTime, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { InventarioService } from '../../../core/services/inventario.service';
import { ProductoService } from '../../../core/services/producto.service';
import { UbicacionService } from '../../../core/services/ubicacion.service';
import { ModalService } from '../../../shared/services/modal.service';

import { Producto } from '../../../core/models/Producto/producto.model';
import { Inventario } from '../../../core/models/inventario/inventario.model';

@Component({
  selector: 'app-inventario-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './inventario-form.component.html'
})
export class InventarioFormComponent implements OnInit {

  form!: FormGroup;
  editMode = false;
  idInventario = 0;

  productosFiltrados: Producto[] = [];
  ubicaciones: any[] = [];

  capacidadMaxima = 0;
  ocupadoActual = 0;
  capacidadDisponible = 0;

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

    // FORMULARIO CORRECTO
    this.form = this.fb.group({
      productoInput: [''], // AUTOCOMPLETE
      producto: this.fb.group({
        idProducto: [null, Validators.required]
      }),
      ubicacion: this.fb.group({
        idUbicacion: [null, Validators.required]
      }),
      cantidad: [1, [Validators.required, Validators.min(1)]]
    });

    this.cargarUbicaciones();
    this.setupAutocomplete();

    // MODO EDITAR
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.editMode = true;
      this.idInventario = +id;
      this.cargarInventario(this.idInventario);
    }

    // Al cambiar ubicación → recalcular capacidad
    this.form.get("ubicacion.idUbicacion")?.valueChanges.subscribe(idUb => {
      const ub = this.ubicaciones.find(u => u.idUbicacion === idUb);
      if (ub) {
        this.capacidadMaxima = ub.capacidadMaxima;
        this.ocupadoActual = ub.ocupadoActual;
        this.calcularCapacidad();
      }
    });

    // Al cambiar cantidad → validar capacidad
    this.form.get("cantidad")?.valueChanges.subscribe(() => this.calcularCapacidad());
  }

  // ============================
  //  CARGA DE DATOS
  // ============================

  cargarUbicaciones() {
    this.ubicacionService.listar().subscribe(u => this.ubicaciones = u);
  }

  cargarInventario(id: number) {
    this.service.buscarPorId(id).subscribe((inv: Inventario) => {
      this.form.patchValue({
        productoInput: inv.producto.nombre,
        producto: { idProducto: inv.producto.idProducto },
        ubicacion: { idUbicacion: inv.ubicacion.idUbicacion },
        cantidad: inv.cantidad
      });
    });
  }

  // ============================
  //  AUTOCOMPLETE PRODUCTO
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
        this.productosFiltrados = productos;
      });
  }

  seleccionarProducto(producto: Producto) {
    this.form.patchValue({
      productoInput: `${producto.nombre} (${producto.codigoSku})`,
      producto: { idProducto: producto.idProducto }
    });

    this.productosFiltrados = [];
  }

  // ============================
  //  CAPACIDAD DE UBICACIÓN
  // ============================

  calcularCapacidad() {
    const cantidad = this.form.get("cantidad")?.value || 0;

    this.capacidadDisponible = this.capacidadMaxima - this.ocupadoActual;

    if (cantidad > this.capacidadDisponible) {
      this.form.get("cantidad")?.setErrors({ capacidad: true });
    }
  }

  // ============================
  //  GUARDAR / CANCELAR
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
      next: () => this.router.navigate(['/dashboard/inventarios']),
      error: (err) => {
        console.error(err);
        this.showModal(err.error || 'Error al guardar inventario', 'Error');
      }
    });
  }

  cancelar() {
    this.router.navigate(['/dashboard/inventarios']);
  }

  private showModal(message: string, title: string, onConfirm?: () => void): void {
    this.modalService.open({
      title,
      message,
      confirmText: 'Aceptar',
      onConfirm
    });
  }
}
