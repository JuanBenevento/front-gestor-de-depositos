import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, AbstractControl, ValidationErrors, ValidatorFn, FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { UbicacionService } from '../../../core/services/ubicacion.service';
import { ZonaService } from '../../../core/services/zona.service';
import { Ubicacion } from '../../../core/models/ubicacion/ubicacion.model';
import { Zona } from '../../../core/models/zona/zona.model';
import { ModalService } from '../../../shared/services/modal.service';

@Component({
  selector: 'app-ubicacion-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './ubicacion-form.component.html'
})
export class UbicacionFormComponent implements OnInit {
  
  form!: FormGroup;
  editMode = false;
  zonas: Zona[] = [];
  loadingZonas = true;
  saving = false; // Bloqueo de botón para evitar doble envío

  constructor(
    private fb: FormBuilder,
    private ubicacionService: UbicacionService,
    private zonaService: ZonaService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.nonNullable.group(
      {
        idUbicacion: [0],
        codigo: ['', Validators.required],
        zona: [null, Validators.required],
        capacidadMaxima: [100, [Validators.required, Validators.min(1)]],
        ocupadoActual: [0, [Validators.required, Validators.min(0)]]
      },
      { validators: this.validarOcupacion() } 
    );

    // Cargar lista de zonas para el select
    this.zonaService.listar().subscribe({
      next: data => {
        this.zonas = data;
        this.loadingZonas = false;
      },
      error: () => {
        this.zonas = [];
        this.loadingZonas = false;
        this.showModal('Error al cargar zonas. Verifique su conexión.', 'Error');
      }
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editMode = true;
      this.ubicacionService.buscarPorId(+id).subscribe({
        next: u => {
          this.form.patchValue({
            idUbicacion: u.idUbicacion,
            codigo: u.codigo,
            zona: u.zona, 
            capacidadMaxima: u.capacidadMaxima,
            ocupadoActual: u.ocupadoActual
          });
        },
        error: () => this.showModal('Error al cargar la ubicación para editar.', 'Error')
      });
    }
  }

  // Getter para mostrar info de la zona seleccionada en el HTML
  get zonaSeleccionada(): Zona | null {
    return this.form.get('zona')?.value;
  }

  // Helper para que el select funcione correctamente en modo edición
  compararZonas(z1: Zona, z2: Zona): boolean {
    return z1 && z2 ? z1.idZona === z2.idZona : z1 === z2;
  }

  validarOcupacion(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const capacidad = group.get('capacidadMaxima')?.value;
      const ocupado = group.get('ocupadoActual')?.value;

      if (capacidad != null && ocupado != null && ocupado > capacidad) {
        const error = { excedeCapacidad: true };
        group.get('ocupadoActual')?.setErrors(error); // Marcar el input específico
        return error; // Marcar el grupo
      }
      
      // Limpiar error si se corrige
      if (group.get('ocupadoActual')?.hasError('excedeCapacidad')) {
         group.get('ocupadoActual')?.setErrors(null);
      }
      return null;
    };
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    this.saving = true;
    // Usamos getRawValue por si hubiera campos deshabilitados que queremos enviar igual
    const ubicacion: Ubicacion = this.form.getRawValue();

    // Validación previa de duplicados en frontend (Opcional, pero útil UX)
    this.ubicacionService.listar().subscribe({
      next: data => {
        const existe = data.some(u =>
          u.codigo.toLowerCase() === ubicacion.codigo.toLowerCase() &&
          u.zona?.idZona === ubicacion.zona?.idZona &&
          (!this.editMode || u.idUbicacion !== ubicacion.idUbicacion)
        );

        if (existe) {
          this.saving = false;
          this.form.get('codigo')?.setErrors({ duplicado: true });
          this.showModal('Ya existe una ubicación con ese código en esta zona.', 'Duplicado');
          return;
        }

        // 💡 CORRECCIÓN APLICADA (Opción 2): Pasamos ID explícito
        const obs = this.editMode
          ? this.ubicacionService.actualizar(ubicacion.idUbicacion!, ubicacion) 
          : this.ubicacionService.crear(ubicacion);

        obs.subscribe({
          next: () => {
            this.saving = false;
            this.showModal('Ubicación guardada correctamente.', 'Éxito', () => {
               this.router.navigate(['/dashboard/ubicaciones']);
            });
          },
          error: err => {
            this.saving = false;
            this.manejarErrores(err);
          }
        });
      },
      error: err => {
        this.saving = false;
        this.showModal('No se pudo validar si la ubicación ya existe. Intente nuevamente.', 'Error');
      }
    });
  }

  private manejarErrores(err: any): void {
    console.error('Error backend:', err);
    let titulo = 'Error';
    let mensaje = 'Ocurrió un error inesperado.';

    if (err.status === 400) {
      titulo = 'Datos Inválidos';
      mensaje = typeof err.error === 'string' ? err.error : (err.error?.message || 'Verifique los datos.');
    } else if (err.status === 409) {
        titulo = 'Conflicto';
        mensaje = err.error?.message || 'Conflicto al guardar la ubicación.';
    }

    this.showModal(mensaje, titulo);
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/ubicaciones']);
  }

  private showModal(message: string, title: string, onConfirm?: () => void): void {
    this.modalService.open({ title, message, confirmText: 'Aceptar', onConfirm });
  }
}