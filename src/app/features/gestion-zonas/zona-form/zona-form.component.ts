import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ZonaService } from '../../../core/services/zona.service';
import { Zona } from '../../../core/models/zona/zona.model';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './zona-form.component.html'
})
export class ZonaFormComponent implements OnInit {

  form!: FormGroup;
  editMode = false;

  constructor(
    private fb: FormBuilder,
    private service: ZonaService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.nonNullable.group({
      idZona: [0],
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required]
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editMode = true;
      this.service.buscarPorId(+id).subscribe(u => {
        this.form.patchValue(u);
      });
    }
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Usar value para evitar incluir controles deshabilitados accidentalmente
    const zona: Zona = this.form.value;

    const obs = this.editMode
      ? this.service.actualizar(zona)
      : this.service.crear(zona);

    obs.subscribe({
      next: () => this.router.navigate(['/dashboard/zonas']),
      error: err => {
        console.error('Error al guardar zona', err);
        alert('Error al guardar');
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/../dashboard/zonas']);  
  }
}

