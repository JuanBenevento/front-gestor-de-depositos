import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Observable, Subject, catchError, debounceTime, distinctUntilChanged, of, switchMap, take, takeUntil, tap } from 'rxjs';
import { Producto } from '../../../core/models/Producto/producto.model';
import { Ubicacion } from '../../../core/models/ubicacion/ubicacion.model';
import { ProductoService } from '../../../core/services/producto.service';
import { UbicacionService } from '../../../core/services/ubicacion.service';
import { MovimientosInventarioService } from '../../../core/services/movimientos-inventario.service';
import { ModalService } from '../../../shared/services/modal.service';
import { MovimientoInventario } from '../../../core/models/movimiento-inventario/movimiento-inventario.module';
import { MOVIMIENTO_INVENTARIO_ESTADOS, MovimientoInventarioEstado } from '../../../core/enums/movimiento-inventario-estado.model';
import { FormTextInputComponent, ValidationMessage } from '../../../shared/components/form-text-input/form-text-input.component';
import { InfoCardComponent } from '../../../shared/components/info-card/info-card.component';

@Component({
  selector: 'app-movimientos-form',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormTextInputComponent, InfoCardComponent],
  templateUrl: './movimientos-form.html',
  styleUrls: ['./movimientos-form.css']
})
export class MovimientosForm implements OnInit, OnDestroy {
  private readonly fb: FormBuilder = inject(FormBuilder);
  private readonly productoService: ProductoService = inject(ProductoService);
  private readonly ubicacionService: UbicacionService = inject(UbicacionService);
  private readonly movimientosService: MovimientosInventarioService = inject(MovimientosInventarioService);
  private readonly modalService: ModalService = inject(ModalService);
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  readonly estados = MOVIMIENTO_INVENTARIO_ESTADOS;
  readonly maxFecha = this.formatDate(new Date());
  readonly validationMessages: Record<string, ValidationMessage[]> = {
    productoId: [{ errorKey: 'required', message: 'El producto es requerido' }],
    ubicacionOrigenId: [{ errorKey: 'required', message: 'La ubicacion de origen es requerida' }],
    ubicacionDestinoId: [{ errorKey: 'required', message: 'La ubicacion de destino es requerida' }],
    cantidad: [
      { errorKey: 'required', message: 'Ingresar una cantidad valida (minimo 1)' },
      { errorKey: 'min', message: 'Ingresar una cantidad valida (minimo 1)' }
    ],
    fecha: [
      { errorKey: 'required', message: 'Seleccionar una fecha valida' },
      { errorKey: 'fechaFutura', message: 'No se permiten fechas futuras' },
      { errorKey: 'fechaInvalida', message: 'Seleccionar una fecha valida' }
    ]
  };
  private readonly noFutureDateValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value ?? '').toString();
    if (!value) {
      return null;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return { fechaInvalida: true };
    }

    return value > this.maxFecha ? { fechaFutura: true } : null;
  };

  form = this.fb.nonNullable.group({
    id_movimiento: [0],
    productoId: ['', [Validators.required]],
    ubicacionOrigenId: ['', [Validators.required]],
    ubicacionDestinoId: ['', [Validators.required]],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    estado: [MovimientoInventarioEstado.REUBICACION, Validators.required],
    fecha: ['', [Validators.required, this.noFutureDateValidator]]
  });

  productoSeleccionado: Producto | null = null;
  ubicacionOrigenSeleccionada: Ubicacion | null = null;
  ubicacionDestinoSeleccionada: Ubicacion | null = null;

  productoError = '';
  ubicacionOrigenError = '';
  ubicacionDestinoError = '';

  editMode = false;
  private movimientoId = 0;
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.form.patchValue({ fecha: this.maxFecha });
    this.setupProductoLookup();
    this.setupUbicacionLookup('ubicacionOrigenId');
    this.setupUbicacionLookup('ubicacionDestinoId');
    this.setupFechaLookup();
    this.tryLoadMovimiento();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  guardar(): void {
    const fechaControl = this.form.get('fecha');
    if (fechaControl?.value && fechaControl.value > this.maxFecha) {
      fechaControl.setErrors({ ...(fechaControl.errors ?? {}), fechaFutura: true });
      fechaControl.markAsTouched();
    }

    if (this.form.invalid || !this.productoSeleccionado || !this.ubicacionOrigenSeleccionada || !this.ubicacionDestinoSeleccionada) {
      this.form.markAllAsTouched();
      this.showModal('Revisar los datos del formulario antes de continuar.', 'Datos incompletos');
      return;
    }

    const raw = this.form.getRawValue();
    const payload = {
      producto: this.productoSeleccionado,
      ubicacionOrigen: { idUbicacion: Number(raw.ubicacionOrigenId) },
      ubicacionDestino: { idUbicacion: Number(raw.ubicacionDestinoId) },
      cantidad: Number(raw.cantidad),
      estado: raw.estado,
      fecha: raw.fecha ? new Date(raw.fecha) : null
    };

    const request$ = this.editMode
      ? this.movimientosService.actualizar({ ...payload, id_movimiento: this.movimientoId })
      : this.movimientosService.crear(payload);

    request$.subscribe({
      next: () => {
        this.showModal('Movimiento de inventario guardado correctamente.', 'Operacion exitosa', () => {
          this.router.navigate(['/dashboard/movimientosInventario']);
        });
      },
      error: () => {
        this.showModal('Ocurrio un error al guardar el movimiento. Intente nuevamente.', 'Error');
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/movimientosInventario']);
  }

  private tryLoadMovimiento(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) return;

    const id = Number(idParam);
    if (!id) return;

    this.editMode = true;
    this.movimientoId = id;
    this.movimientosService.buscarPorId(id).subscribe({
      next: movimiento => this.patchFormForEdit(movimiento),
      error: () => this.showModal('No se pudo cargar el movimiento solicitado.', 'Error', () => this.cancelar())
    });
  }

  private patchFormForEdit(movimiento: MovimientoInventario): void {
    const fecha = movimiento.fecha ? this.formatDate(new Date(movimiento.fecha)) : '';
  const origenId = this.extractUbicacionId(movimiento.ubicacionOrigen);
  const destinoId = this.extractUbicacionId(movimiento.ubicacionDestino);
  const productoId = movimiento.producto?.idProducto ?? (movimiento.producto as any)?.id ?? null;

    this.form.patchValue({
      id_movimiento: movimiento.id_movimiento ?? 0,
      productoId: productoId ? productoId.toString() : '',
      ubicacionOrigenId: origenId,
      ubicacionDestinoId: destinoId,
      cantidad: movimiento.cantidad,
        estado: this.estados.includes(movimiento.estado as MovimientoInventarioEstado)
          ? (movimiento.estado as MovimientoInventarioEstado)
          : MovimientoInventarioEstado.REUBICACION,
      fecha
    }, { emitEvent: false });
    this.form.get('fecha')?.updateValueAndValidity();

    this.productoSeleccionado = movimiento.producto ?? null;
    if (productoId) {
      this.form.get('productoId')?.setValue(productoId.toString(), { emitEvent: false });
    }

    if (origenId) {
      this.lookupUbicacion(origenId)
        .pipe(take(1))
        .subscribe({
          next: (ubicacion: Ubicacion) => (this.ubicacionOrigenSeleccionada = ubicacion),
          error: () => {
            this.ubicacionOrigenSeleccionada = null;
            this.ubicacionOrigenError = 'Ubicacion no encontrada';
          }
        });
    }
    if (destinoId) {
      this.lookupUbicacion(destinoId)
        .pipe(take(1))
        .subscribe({
          next: (ubicacion: Ubicacion) => (this.ubicacionDestinoSeleccionada = ubicacion),
          error: () => {
            this.ubicacionDestinoSeleccionada = null;
            this.ubicacionDestinoError = 'Ubicacion no encontrada';
          }
        });
    }
  }

  private setupProductoLookup(): void {
  const control = this.form.get('productoId');
    if (!control) return;

    control.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      tap(() => {
        this.productoError = '';
      }),
      switchMap(value => {
        const id = Number(value);
        if (!id) {
          this.productoSeleccionado = null;
          if (value) {
            this.productoError = 'Ingrese un ID valido';
          }
          return of(null as Producto | null);
        }
        return this.productoService.buscarPorId(id).pipe(
          tap(producto => {
            this.productoSeleccionado = producto;
          }),
          catchError(() => {
            this.productoSeleccionado = null;
            this.productoError = 'Producto no encontrado';
            return of(null as Producto | null);
          })
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private setupUbicacionLookup(controlName: 'ubicacionOrigenId' | 'ubicacionDestinoId'): void {
    const control = this.form.get(controlName);
    if (!control) return;

    control.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      tap(() => {
        if (controlName === 'ubicacionOrigenId') {
          this.ubicacionOrigenError = '';
        } else {
          this.ubicacionDestinoError = '';
        }
      }),
      switchMap(value => {
        const id = Number(value);
        if (!id) {
          if (controlName === 'ubicacionOrigenId') {
            this.ubicacionOrigenSeleccionada = null;
          } else {
            this.ubicacionDestinoSeleccionada = null;
          }
          if (value) {
            if (controlName === 'ubicacionOrigenId') {
              this.ubicacionOrigenError = 'Ingrese un ID valido';
            } else {
              this.ubicacionDestinoError = 'Ingrese un ID valido';
            }
          }
          return of(null as Ubicacion | null);
        }
        return this.lookupUbicacion(value).pipe(
          tap(ubicacion => {
            if (ubicacion) {
              if (controlName === 'ubicacionOrigenId') {
                this.ubicacionOrigenSeleccionada = ubicacion;
              } else {
                this.ubicacionDestinoSeleccionada = ubicacion;
              }
            }
          }),
          catchError(() => {
            if (controlName === 'ubicacionOrigenId') {
              this.ubicacionOrigenSeleccionada = null;
              this.ubicacionOrigenError = 'Ubicacion no encontrada';
            } else {
              this.ubicacionDestinoSeleccionada = null;
              this.ubicacionDestinoError = 'Ubicacion no encontrada';
            }
            return of(null as Ubicacion | null);
          })
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private setupFechaLookup(): void {
    const control = this.form.get('fecha');
    if (!control) return;

    control.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        if (!value) {
          return;
        }

        if (value > this.maxFecha) {
          control.setErrors({ ...(control.errors ?? {}), fechaFutura: true });
        } else if (control.errors?.['fechaFutura']) {
          const cleanedErrors = { ...(control.errors ?? {}) } as Record<string, unknown>;
          delete cleanedErrors['fechaFutura'];
          control.setErrors(Object.keys(cleanedErrors).length ? cleanedErrors : null);
        }
      });
  }

  private lookupUbicacion(value: string | number): Observable<Ubicacion> {
    const id = Number(value);
    return this.ubicacionService.buscarPorId(id);
  }

  private extractUbicacionId(ubicacion: { idUbicacion?: number; id_ubicacion?: number } | undefined | null): string {
    if (!ubicacion) return '';
    const id = ubicacion.id_ubicacion ?? ubicacion.idUbicacion;
    return id ? id.toString() : '';
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private showModal(message: string, title: string, onConfirm?: () => void): void {
    this.modalService.open({ title, message, confirmText: 'Aceptar', onConfirm });
  }

}
