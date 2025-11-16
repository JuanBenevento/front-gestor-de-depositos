import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Proveedor } from '../../../core/models/proveedor/proveedor.model';
import { ProveedoresService } from '../../../core/services/proveedores.service';
import { ModalService } from '../../../shared/services/modal.service';

@Component({
  selector: 'app-proveedor-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './proveedores-form.component.html'
})
export class ProveedoresFormComponent implements OnInit {

  form!: FormGroup;
  editMode = false;
  private providerId: number = 0;

  constructor(
    private fb: FormBuilder,
    private service: ProveedoresService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.nonNullable.group({
      id: [0],
      nombre: ['', Validators.required],
      telefono: ['', Validators.required],
      email: ['', Validators.required]
    });

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.editMode = true;
      this.service.buscarPorId(+id).subscribe(u => {
        this.form.patchValue(u);
      });
      this.providerId = +id;
    }
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const proveedor: Proveedor = this.form.value;
    proveedor.id_proveedor = this.providerId;

    const obs = this.editMode
      ? this.service.actualizar(proveedor)
      : this.service.crear(proveedor);

    obs.subscribe({
      next: () => this.router.navigate(['/dashboard/proveedores']),
      error: err  => {
        console.error('Error al guardar proveedor', err);
        this.showModal('Error al guardar', 'Error');
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/../dashboard/proveedores']);  
  }

  private showModal(message: string, title = 'Informacion'): void {
    this.modalService.open({ title, message, confirmText: 'Aceptar' });
  }
}

