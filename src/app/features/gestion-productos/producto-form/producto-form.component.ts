import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductoService } from '../../../core/services/producto.service';
import { Producto} from '../../../core/models/Producto/producto.model'; 
import { ModalService } from '../../../shared/services/modal.service';
import { CategoriasProducto } from '../../../core/enums/categoriasProductos.model';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './producto-form.component.html'
})
export class ProductoFormComponent implements OnInit {

  form!: FormGroup;
  editMode = false;
  saving = false; // Bloqueo de botón

  // 💡 Convertimos el Enum en un Array para usarlo en el HTML (*ngFor)
  categorias = Object.values(CategoriasProducto);

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
      // 💡 Nuevo control para categoría
      categoria: [null, Validators.required], 
      fecha_creacion: ['']
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editMode = true;
      this.service.buscarPorId(+id).subscribe({
        next: p => this.form.patchValue(p),
        error: () => this.showModal('Error al cargar el producto', 'Error')
      });
    }
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true; // Activar bloqueo
    const producto: Producto = this.form.value;

    const obs = this.editMode
      ? this.service.actualizar(producto)
      : this.service.crear(producto);

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.showModal('Operación exitosa.', 'Éxito', () => {
             this.router.navigate(['/dashboard/productos']);
        });
      },
      error: (err) => {
        this.saving = false;
        this.manejarErrores(err);
      }
    });
  }

  private manejarErrores(err: any): void {
    console.error('Error backend:', err);
    let titulo = 'Error';
    let mensaje = 'Ocurrió un error inesperado.';

    // 1. Error de Validación (Ej: SKU duplicado) - Backend devuelve 400 + String
    if (err.status === 400) {
      titulo = 'Datos Inválidos';
      if (typeof err.error === 'string') {
        mensaje = err.error; 
      } else if (err.error?.message) {
        mensaje = err.error.message;
      }
    } else if (err.status === 500) {
      mensaje = 'Error interno del servidor.';
    }

    this.showModal(mensaje, titulo);
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/productos']);
  }

  private showModal(message: string, title: string, onConfirm?: () => void): void {
    this.modalService.open({ title, message, confirmText: 'Aceptar', onConfirm });
  }
}