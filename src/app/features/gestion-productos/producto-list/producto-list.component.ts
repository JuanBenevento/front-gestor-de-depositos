import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../core/services/producto.service';
import { Producto } from '../../../core/models/Producto/producto.model';

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
    private router: Router
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
    if (confirm('¿Seguro que deseas eliminar este producto?')) {
      this.productoService.borrar(id).subscribe({
        next: () => {
          alert('Producto eliminado correctamente');
          this.refresh();
        },
        error: err => {
          console.error('Error al eliminar producto', err);
          alert('Error al eliminar producto');
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
        this.error = `No se encontró producto con codigo SKU "${sku}".`;
        this.productos = [];
        this.loading = false;
      }
    });
  }

  volver(): void {
    this.router.navigate(['/dashboard']);
  }
}
