import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ClienteService } from '../../../core/services/cliente.service';
import { Cliente } from '../../../core/models/cliente/cliente.model';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './cliente-form.component.html',
  styleUrls: ['./cliente-form.component.css']
})
export class ClienteFormComponent implements OnInit {

  form!: FormGroup;
  editMode = false;

  constructor(
    private fb: FormBuilder,
    private service: ClienteService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.nonNullable.group({
      idCliente: [0],
      nombre: ['', Validators.required],
      telefono: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
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

    const cliente: Cliente = this.form.value;

    const obs = this.editMode
      ? this.service.actualizar(cliente.idCliente as number, cliente)
      : this.service.crear(cliente);

    obs.subscribe({
      next: () => this.router.navigate(['/dashboard/clientes']),
      error: err => {
        console.error('Error al guardar cliente', err);
        if (err && err.status === 401) {
          alert('No autorizado. La sesion puede haber expirado.');
        } else if (err && err.status === 400) {
          alert('Datos invalidos. Verifique el formulario.');
        } else {
          alert('Error al guardar');
        }
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/../dashboard/clientes']);  
  }
}

