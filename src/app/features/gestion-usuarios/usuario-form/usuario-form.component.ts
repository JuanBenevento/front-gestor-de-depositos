import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UsuarioService } from '../../../core/services/usuario.service';
import { Usuario } from '../../../core/models/usuario/usuario.model';
import { ModalService } from '../../../shared/services/modal.service';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './usuario-form.component.html'
})
export class UsuarioFormComponent implements OnInit {

  form!: FormGroup;
  editMode = false;

  constructor(
    private fb: FormBuilder,
    private service: UsuarioService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.nonNullable.group({
      idUsuario: [0],
      nombre: ['', Validators.required],
      contrasenia: [''],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      idRol: [1, Validators.required]
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

    const user: Usuario = this.form.value;

    const obs = this.editMode
      ? this.service.actualizar(user)
      : this.service.crear(user);

    obs.subscribe({
      next: () => this.router.navigate(['/dashboard/usuarios']),
      error: err => {
        console.error('Error al guardar usuario', err);
        if (err && err.status === 401) {
          this.showModal('No autorizado. La sesion puede haber expirado.', 'Error');
        } else if (err && err.status === 400) {
          this.showModal('Datos invalidos. Verifique el formulario.', 'Error');
        } else {
          this.showModal('Error al guardar', 'Error');
        }
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/../dashboard/usuarios']);  
  }

  private showModal(message: string, title = 'Informacion'): void {
    this.modalService.open({ title, message, confirmText: 'Aceptar' });
  }
}

