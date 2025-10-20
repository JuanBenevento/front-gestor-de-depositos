import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UsuarioService } from '../../../core/services/usuario.service';
import { Usuario } from '../../../core/models/usuario/usuario.model';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './usuario-form.component.html',
  styleUrls: ['./usuario-form.component.css']
})
export class UsuarioFormComponent implements OnInit {

  form!: FormGroup;
  editMode = false;

  constructor(
    private fb: FormBuilder,
    private service: UsuarioService,
    private route: ActivatedRoute,
    private router: Router
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
    const user: Usuario = this.form.getRawValue();

    const obs = this.editMode
      ? this.service.actualizar(user)
      : this.service.crear(user);

    obs.subscribe({
      next: () => this.router.navigate(['../'], { relativeTo: this.route }),
      error: () => alert('Error al guardar')
    });
  }
}

