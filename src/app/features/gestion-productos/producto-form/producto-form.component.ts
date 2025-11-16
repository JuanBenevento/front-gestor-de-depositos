import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductoService } from '../../../core/services/producto.service';
import { Producto } from '../../../core/models/Producto/producto.model';
import { ModalService } from '../../../shared/services/modal.service';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './producto-form.component.html'
})
export class ProductoFormComponent implements OnInit {

  form!: FormGroup;
  editMode = false;

  constructor(
    private fb: FormBuilder,
    private service: ProductoService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.nonNullable.group({
      idProducto: [0],
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      codigoSku: ['', Validators.required],
      unidad_medida: ['', Validators.required],
      fecha_creacion: ['']
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editMode = true;
      this.service.buscarPorId(+id).subscribe(p => {
        this.form.patchValue(p);
      });
    }
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const producto: Producto = this.form.value;

    const obs = this.editMode
      ? this.service.actualizar(producto)
      : this.service.crear(producto);

    obs.subscribe({
      next: () => this.router.navigate(['/dashboard/productos']),
      error: err => {
        console.error('Error al guardar producto', err);
        this.showModal('Error al guardar producto', 'Error');
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/productos']);
  }

  private showModal(message: string, title = 'Informacion'): void {
    this.modalService.open({ title, message, confirmText: 'Aceptar' });
  }
}
