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
  productosFiltrados: Producto[] = []; 
  loading = true;
  error = '';

  skuBuscar: string = '';
  nombreBuscar: string = '';
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
    this.skuBuscar = '';
    this.nombreBuscar = '';
    this.filtrado = false;

    this.productoService.listar().subscribe({
      next: data => {
        this.productos = data;
        this.productosFiltrados = data; 
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

  aplicarFiltros(): void {
    const sku = this.skuBuscar?.toLowerCase().trim();
    const nombre = this.nombreBuscar?.toLowerCase().trim();

    let lista = this.productos;

    if (sku) {
      lista = lista.filter(p => p.codigoSku?.toLowerCase().includes(sku));
    }

    if (nombre) {
      lista = lista.filter(p => p.nombre?.toLowerCase().includes(nombre));
    }

    this.productosFiltrados = lista;

    this.filtrado = !!sku || !!nombre; 
  }

  limpiarFiltros(): void {
    this.skuBuscar = '';
    this.nombreBuscar = '';
    this.aplicarFiltros(); 
  }

  private showModal(message: string, title = 'Informacion'): void {
    this.modalService.open({ title, message, confirmText: 'Aceptar' });
  }
}
