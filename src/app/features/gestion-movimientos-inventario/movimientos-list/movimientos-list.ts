import { Component, OnInit } from '@angular/core';
import { MovimientosInventarioService } from '../../../core/services/movimientos-inventario.service';
import { Router } from '@angular/router';
import { MovimientoInventario } from '../../../core/models/movimiento-inventario/movimiento-inventario.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../../shared/services/modal.service';
import { Producto } from '../../../core/models/Producto/producto.model';

@Component({
  selector: 'app-movimientos-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './movimientos-list.html',
})
export class MovimientosList implements OnInit {

  movimientos: MovimientoInventario[] = [];
  movimientosOriginal: MovimientoInventario[] = []; 
  loading = true;
  error = '';
  estadoBuscar: string = '';
  filtrado = false;
  fechaBuscar: string = '';
  nombreBuscar: string = '';

  constructor(
    private service: MovimientosInventarioService,
    private router: Router,
    private modalService: ModalService
  ) {}

ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.service.listar().subscribe({
      next: (data: MovimientoInventario[]) => {
        this.movimientosOriginal = data; 
        this.movimientos = data;        
        this.aplicarFiltros();       
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar movimientos de inventario';
        this.loading = false;
      }
    });
  }

  eliminar(id: number): void {
    this.modalService.open({
      title: 'Eliminar movimiento',
      message: '¿Eliminar movimiento de inventario?',
      confirmText: 'Eliminar',
      showCancelButton: true,
      onConfirm: () => this.confirmarEliminacion(id)
    });
  }

  private confirmarEliminacion(id: number): void {
    this.service.eliminar(id).subscribe({
      next: () => {
        this.refresh();
        this.showModal('El movimiento de inventario se eliminó correctamente.', 'Operación exitosa');
      },
      error: () => this.showModal('Error al eliminar el movimiento de inventario.', 'Error')
    });
  }

  private showModal(message: string, title: string, onConfirm?: () => void): void {
    this.modalService.open({
      title,
      message,
      confirmText: 'Aceptar',
      onConfirm
    });
  }

  limpiarFiltros(): void {
    this.estadoBuscar = '';
    this.nombreBuscar = ''; 
    this.fechaBuscar = '';  
    this.filtrado = false;
    this.aplicarFiltros(); 
  }

  aplicarFiltros(): void {
    let movimientosFiltrados = this.movimientosOriginal;

    this.filtrado = !!this.estadoBuscar || !!this.nombreBuscar || !!this.fechaBuscar;

    if (this.estadoBuscar) {
      const estadoBuscado = this.estadoBuscar.toLowerCase().trim();
      movimientosFiltrados = movimientosFiltrados.filter(m => 
        m.estado?.toLowerCase() === estadoBuscado 
      );
    }

    if (this.nombreBuscar) {
      const nombreBuscado = this.nombreBuscar.toLowerCase().trim();
      movimientosFiltrados = movimientosFiltrados.filter(m =>
        m.producto?.nombre?.toLowerCase().includes(nombreBuscado) 
      );
    }
    
    if (this.fechaBuscar) {
      movimientosFiltrados = movimientosFiltrados.filter(m => 
        m.fecha && new Date(m.fecha).toISOString().substring(0, 10) === this.fechaBuscar
      );
    }

    this.movimientos = movimientosFiltrados;
  }
}
