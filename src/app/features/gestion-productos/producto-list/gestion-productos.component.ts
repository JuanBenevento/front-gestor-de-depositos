import { Component, inject, OnInit } from '@angular/core';
import { ProductoService } from '../../../core/services/producto.service';
import { Producto } from '../../../core/models/producto/producto.model';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gestion-productos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './gestion-productos.component.html',
  styleUrl: './gestion-productos.component.css'
})
export class GestionProductosListComponent implements OnInit {

  constructor(
    private productoService: ProductoService,
    private router: Router
  ) {}

  productos: Producto[] = [];
  loading = true;
  error = '';
  idBuscar: string = '';
  filtrado = false;

  ngOnInit(): void {
    this.refresh();
  }

    refresh(): void {
    this.loading = true;
    this.error = '';
    this.idBuscar = '';
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

  volver(): void {
    this.router.navigate(['/dashboard']);
  }

  eliminar(id: number): void {
    if (confirm('¿Eliminar producto?')) {
      this.productoService.eliminar(id).subscribe({
        next: () => this.refresh(),
        error: () => alert('Error al eliminar')
      });
    }
  }

  buscarPorId(): void {
    const id = +this.idBuscar;
    if (!id) { return; }
    this.error = '';
    this.loading = true;
    this.productoService.buscarPorId(id).subscribe({
      next: data => {
        this.productos = [data];
        this.loading = false;
        this.filtrado = true;
      },
      error: () => {
        this.error = 'Producto no encontrado.';
        this.productos = [];
        this.loading = false;
      }
    });
  }
}
