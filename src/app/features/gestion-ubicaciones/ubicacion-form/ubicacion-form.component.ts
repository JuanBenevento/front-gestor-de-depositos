import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { UbicacionService } from '../../../core/services/ubicacion.service';
import { ZonaService } from '../../../core/services/zona.service';
import { Ubicacion } from '../../../core/models/ubicacion/ubicacion.model';
import { Zona } from '../../../core/models/zona/zona.model';
import { FormsModule } from '@angular/forms';

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

  constructor(
    private fb: FormBuilder,
    private ubicacionService: UbicacionService,
    private zonaService: ZonaService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.form = this.fb.nonNullable.group(
      {
        idUbicacion: [0],
        codigo: ['', Validators.required],
        zona: [null, Validators.required],
        capacidadMaxima: [0, [Validators.required, Validators.min(0)]],
        ocupadoActual: [0, [Validators.required, Validators.min(0)]]
      },
      { validators: this.validarOcupacion() } 
    );

    this.zonaService.listar().subscribe({
      next: data => {
        this.zonas = data;
        this.loadingZonas = false;
      },
      error: () => {
        this.zonas = [];
        this.loadingZonas = false;
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
        error: () => alert('Error al cargar la ubicacion')
      });
    }
  }

  validarOcupacion(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const capacidad = group.get('capacidadMaxima')?.value;
      const ocupado = group.get('ocupadoActual')?.value;

      if (capacidad != null && ocupado != null && ocupado > capacidad) {
        group.get('ocupadoActual')?.setErrors({ excedeCapacidad: true });
        return { excedeCapacidad: true };
      }

      return null;
    };
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const ubicacion: Ubicacion = this.form.getRawValue();

    this.ubicacionService.listar().subscribe({
      next: data => {
        const existe = data.some(u =>
          u.codigo === ubicacion.codigo &&
          u.zona?.idZona === ubicacion.zona?.idZona &&
          (!this.editMode || u.idUbicacion !== ubicacion.idUbicacion)
        );

        if (existe) {
          this.form.get('codigo')?.setErrors({ duplicado: true });
          this.form.get('codigo')?.markAsTouched();
          alert('Ya existe una ubicacion con ese codigo en la zona seleccionada.');
          return;
        }

        const obs = this.editMode
          ? this.ubicacionService.actualizar(ubicacion.idUbicacion!, ubicacion)
          : this.ubicacionService.crear(ubicacion);

        obs.subscribe({
          next: () => this.router.navigate(['/dashboard/ubicaciones']),
          error: err => {
            console.error(err);
            alert('Error al guardar la ubicacion.');
          }
        });
      },
      error: err => {
        console.error('Error al validar duplicados', err);
        alert('No se pudo validar si la ubicacion ya existe. Intente nuevamente.');
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/ubicaciones']);
  }
}
