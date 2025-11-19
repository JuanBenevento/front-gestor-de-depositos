import { Component, OnInit } from '@angular/core';
import { MovimientosInventarioService } from '../../../core/services/movimientos-inventario.service';
import { Router } from '@angular/router';
import { MovimientoInventario } from '../../../core/models/movimiento-inventario/movimiento-inventario.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../../shared/services/modal.service';

@Component({
  selector: 'app-movimientos-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './movimientos-list.html',
  styleUrls: ['./movimientos-list.css']
})
export class MovimientosList implements OnInit {

  movimientos: MovimientoInventario[] = [];
  loading = true;
  error = '';
  idBuscar: string = '';
  filtrado = false;
  fechaBuscar: string = '';
  idProductoBuscar: string = '';

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
        this.movimientos = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar movimientos de inventario';
        this.loading = false;
      }
    });
  }

  volver(): void {
    this.router.navigate(['/dashboard']);
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
    this.idBuscar = '';
    this.filtrado = false;
    this.refresh();
  }

  aplicarFiltros(): void {
    this.filtrado = !!this.idBuscar;

    let movimientosFiltrados = this.movimientos;

    if (this.idBuscar) {
      const idBuscado = +this.idBuscar;
      movimientosFiltrados = movimientosFiltrados.filter(m => m.id_movimiento === idBuscado);
    }

    this.movimientos = movimientosFiltrados;
  }
}
