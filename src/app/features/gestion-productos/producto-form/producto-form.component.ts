import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductoService } from '../../../core/services/producto.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Producto } from '../../../core/models/producto/producto.model';

@Component({
  selector: 'app-producto-form',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './producto-form.component.html',
  styleUrl: './producto-form.component.css'
})
export class ProductoFormComponent implements OnInit {

  constructor(
    private productoService: ProductoService,
    private form: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ){}


  editMode: boolean = false;
  formGroup!: FormGroup;


  ngOnInit(): void {
    this.formGroup = this.form.nonNullable.group({
      id: [0],
      nombre: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      codigoSku: ['', [Validators.required]],
      unidad_medida: ['unidad', [Validators.required]]
    });

    const id = this.route.snapshot.paramMap.get('id');

    if(id){
      this.editMode = true;
      this.productoService.buscarPorId(+id).subscribe(data =>
        this.formGroup.patchValue(data)
      );
    }
  }

  guardar(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const producto: Producto = this.formGroup.value;

    const obs = this.editMode
      ? this.productoService.actualizar(producto)
      : this.productoService.crear(producto);

    obs.subscribe({
      next: () => this.router.navigate(['/dashboard/productos']),
      error: err => {
        console.error('Error al guardar producto', err);
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
    this.router.navigate(['/../dashboard/productos'])
  }
}
