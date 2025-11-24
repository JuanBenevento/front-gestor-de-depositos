import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
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
  saving = false;

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
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      contrasenia: [''], 
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      idRol: [1, Validators.required]
    });

    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      this.editMode = true;
      this.form.controls['contrasenia'].removeValidators(Validators.required);
      
      this.service.buscarPorId(+id).subscribe({
        next: u => {
          this.form.patchValue(u);
        },
        error: () => this.showModal('Error al cargar el usuario para editar.', 'Error')
      });
    } else {
      this.form.controls['contrasenia'].addValidators([Validators.required, Validators.minLength(4)]);
    }
    
    this.form.controls['contrasenia'].updateValueAndValidity();
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true; 
    const user: Usuario = this.form.value;

    const obs = this.editMode
      ? this.service.actualizar(user)
      : this.service.crear(user);

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.showModal('Operación exitosa.', 'Éxito', () => {
             this.router.navigate(['/dashboard/usuarios']);
        });
      },
      error: (err) => {
        this.saving = false; 
        this.manejarErrores(err);
      }
    });
  }

  private manejarErrores(err: any): void {
    console.error('Error:', err);
    let mensaje = 'Ocurrió un error inesperado.';
    let titulo = 'Error';

    if (err.status === 400) {
      titulo = 'Datos Inválidos';
      if (typeof err.error === 'string') {
        mensaje = err.error; 
      } else if (err.error?.message) {
        mensaje = err.error.message;
      }
    } 
    else if (err.status === 401 || err.status === 403) {
      mensaje = 'Su sesion ha expirado o no tiene permisos.';
    }
    else if (err.status === 500) {
      mensaje = 'Error interno del servidor.';
    }

    this.showModal(mensaje, titulo);
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/usuarios']);  
  }

  private showModal(message: string, title: string, onConfirm?: () => void): void {
    this.modalService.open({ title, message, confirmText: 'Aceptar', onConfirm });
  }
}