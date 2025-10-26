import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
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
  templateUrl: './ubicacion-form.component.html',
  styleUrls: ['./ubicacion-form.component.css']
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
    this.form = this.fb.nonNullable.group({
      idUbicacion: [0],
      codigo: ['', Validators.required],
      zona: [null, Validators.required], // guardaremos objeto zona { idZona: ... }
      capacidadMaxima: [0, [Validators.required, Validators.min(0)]],
      ocupadoActual: [0, [Validators.required, Validators.min(0)]]
    });

    // cargar zonas para el select
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
          // backend devuelve zona completo en DTO, parcheamos
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

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const ubicacion: Ubicacion = this.form.getRawValue();

    const obs = this.editMode
      ? this.ubicacionService.actualizar(ubicacion.idUbicacion!, ubicacion)
      : this.ubicacionService.crear(ubicacion);

    obs.subscribe({
      next: () => this.router.navigate(['/dashboard/ubicaciones']),
      error: (err) => {
        console.error(err);
        alert('Error al guardar la ubicación: ');
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/ubicaciones']);
  }
}
