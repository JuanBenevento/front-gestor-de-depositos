import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ZonaService } from '../../../core/services/zona.service';
import { Zona } from '../../../core/models/zona/zona.model';
import { ModalService } from '../../../shared/services/modal.service';
import { CategoriasProducto } from '../../../core/enums/categoriasProductos.model';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './zona-form.component.html'
})
export class ZonaFormComponent implements OnInit {

  form!: FormGroup;
  editMode = false;
  saving = false; // Bloqueo de botón

  // Lista de opciones para el checkbox/select múltiple
  categoriasOpciones = Object.values(CategoriasProducto);

  constructor(
    private fb: FormBuilder,
    private service: ZonaService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.nonNullable.group({
      idZona: [0],
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      categoriasAdmitidas: [[], Validators.required] 
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editMode = true;
      this.service.buscarPorId(+id).subscribe({
        next: z => this.form.patchValue(z),
        error: () => this.showModal('Error al cargar la zona', 'Error')
      });
    }
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const zona: Zona = this.form.value;

    const obs = this.editMode
      ? this.service.actualizar(zona)
      : this.service.crear(zona);

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.showModal('Zona guardada correctamente.', 'Éxito', () => {
             this.router.navigate(['/dashboard/zonas']);
        });
      },
      error: (err) => {
        this.saving = false;
        console.error('Error al guardar zona', err);
        this.showModal('Error al guardar la zona.', 'Error');
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/../dashboard/zonas']);  
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

