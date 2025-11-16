import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ubicacion } from '../../../core/models/ubicacion/ubicacion.model';
import { UbicacionService } from '../../../core/services/ubicacion.service';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReporteUbicacion } from '../../../core/models/ubicacion/reporte-ubicacion.model';
import { ModalService } from '../../../shared/services/modal.service';

@Component({
  selector: 'app-ubicaciones-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './ubicacion-list.component.html'
})
export class UbicacionListComponent implements OnInit {
  ubicaciones: Ubicacion[] = [];
  loading = true;
  error = '';
  idBuscar: string = '';
  filtrado = false;
  reporte: ReporteUbicacion[] = [];
  mostrandoReporte = false;

  constructor(
    private ubicacionService: UbicacionService,
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
    this.filtrado = false;
    this.mostrandoReporte = false;

    this.ubicacionService.listar().subscribe({
      next: data => { 
        this.ubicaciones = data;
        this.loading = false; 
      },
      error: () => { 
        this.error = 'Error al cargar ubicaciones.'; 
        this.loading = false; 
      }
    });
  }

  eliminar(id?: number): void {
    if (!id) return;
    this.modalService.open({message: '¿Eliminar ubicación?', title: 'Eliminar', onConfirm: () => this.onConfirm(id)});
  }

  onConfirm = (id: number) => {
    this.ubicacionService.eliminar(id).subscribe({
      next: () => this.refresh(),
      error: (err) => this.showModal(`Error al eliminar: ${err?.error || err?.message || ''}`, 'Error')
    });
  }

  buscarPorId(): void {
    const id = +this.idBuscar;
    if (!id) { return; }
    this.error = '';
    this.loading = true;
    this.ubicacionService.buscarPorId(id).subscribe({
      next: data => { this.ubicaciones = [data]; this.loading = false; this.filtrado = true; },
      error: () => { this.error = 'Ubicación no encontrada.'; this.loading = false; }
    });
  }

  limpiarFiltro(): void {
    this.idBuscar = '';
    this.filtrado = false;
    this.refresh();
  }

  verReporte(): void {
  this.ubicacionService.listar().subscribe({
    next: data => { 
      this.reporte = data.map(u => ({
        idUbicacion: u.idUbicacion,
        codigo: u.codigo,
        zonaNombre: u.zona?.nombre || '-',
        capacidadMaxima: u.capacidadMaxima,
        ocupadoActual: u.ocupadoActual,
        espacioDisponible: u.capacidadMaxima - u.ocupadoActual
      }));
      this.mostrandoReporte = true;
    },
    error: () => this.showModal('Error al obtener reporte', 'Error')
  });
}


  volver(): void {
    this.router.navigate(['/dashboard']);
  }

  private showModal(message: string, title = 'Informacion'): void {
    this.modalService.open({ title, message, confirmText: 'Aceptar' });
  }
}
