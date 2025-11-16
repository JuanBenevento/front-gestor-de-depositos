import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../core/services/producto.service';
import { Producto } from '../../../core/models/Producto/producto.model';
import { ModalService } from '../../../shared/services/modal.service';

@Component({
  selector: 'app-producto-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './producto-list.component.html'
})
export class ProductoListComponent implements OnInit {

  productos: Producto[] = [];
  loading = true;
  error = '';
  idBuscar: string = '';
  skuBuscar: string = '';
  filtrado = false;

  constructor(
    private productoService: ProductoService,
    private router: Router,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.error = '';
    this.idBuscar = '';
    this.skuBuscar = '';
    this.filtrado = false;

    this.productoService.listar().subscribe({
      next: data => {
        this.productos = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar productos.';
        this.loading = false;
      }
    });
  }

  eliminar(id: number): void {
    this.modalService.open({ 
      title: 'Eliminar', 
      message: '¿Seguro que deseas eliminar este producto?', 
      confirmText: 'Aceptar', 
      onConfirm: () => this.onConfirm(id),
      showCancelButton: true,
      cancelText: 'Cancelar'
    });
  }

  onConfirm(id: number): void {
    if (id) {
      this.productoService.borrar(id).subscribe({
        next: () => {
          this.showModal('Producto eliminado correctamente', 'Éxito');
          this.refresh();
        },
        error: err => {
          console.error('Error al eliminar producto', err);
          this.showModal('Error al eliminar producto', 'Error');
        }
      });
    }
  }

  buscarPorId(): void {
    const id = +this.idBuscar;
    if (!id) return;

    this.error = '';
    this.loading = true;
    this.productoService.buscarPorId(id).subscribe({
      next: producto => {
        this.productos = [producto];
        this.loading = false;
        this.filtrado = true;
      },
      error: () => {
        this.error = `No se encontró el producto con ID ${id}.`;
        this.productos = [];
        this.loading = false;
      }
    });
  }

    buscarPorSku(): void {
    const sku = this.skuBuscar.trim().toUpperCase();
    if (!sku) return;

    this.error = '';
    this.loading = true;

    this.productoService.buscarPorCodigoSku(sku).subscribe({
      next: producto => {
        this.productos = [producto];
        this.loading = false;
        this.filtrado = true;
      },
      error: () => {
        this.error = `No se encontro producto con codigo SKU "${sku}".`;
        this.productos = [];
        this.loading = false;
      }
    });
  }

  volver(): void {
    this.router.navigate(['/dashboard']);
  }

  private showModal(message: string, title = 'Informacion'): void {
    this.modalService.open({ title, message, confirmText: 'Aceptar' });
  }
}
