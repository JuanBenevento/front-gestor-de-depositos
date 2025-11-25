import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UbicacionService } from '../../../core/services/ubicacion.service';
import { Ubicacion } from '../../../core/models/ubicacion/ubicacion.model';
import { ReporteUbicacion } from '../../../core/models/ubicacion/reporte-ubicacion.model'; 
import { ModalService } from '../../../shared/services/modal.service';

@Component({
  selector: 'app-ubicacion-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './ubicacion-list.component.html'
})
export class UbicacionListComponent implements OnInit {

  ubicaciones: Ubicacion[] = [];
  ubicacionesOriginal: Ubicacion[] = [];
  
  loading = true;
  error = '';

  codigoBuscar: string = '';
  zonaBuscar: string = '';
  filtrado = false;

  reporte: any[] = []; 
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
    this.codigoBuscar = '';
    this.zonaBuscar = '';
    this.filtrado = false;
    this.mostrandoReporte = false;

    this.ubicacionService.listar().subscribe({
      next: data => { 
        this.ubicacionesOriginal = data; 
        this.ubicaciones = data;        
        this.loading = false; 
      },
      error: () => { 
        this.error = 'Error al cargar ubicaciones.'; 
        this.loading = false; 
      }
    });
  }

  aplicarFiltros(): void {
    let lista = this.ubicacionesOriginal;

    const codigo = this.codigoBuscar?.toLowerCase().trim();
    const zona = this.zonaBuscar?.toLowerCase().trim();

    this.filtrado = !!codigo || !!zona;

    if (codigo) {
      lista = lista.filter(u => u.codigo.toLowerCase().includes(codigo));
    }

    if (zona) {
      lista = lista.filter(u => 
        u.zona?.nombre?.toLowerCase().includes(zona)
      );
    }

    this.ubicaciones = lista;
  }

  limpiarFiltros(): void {
    this.codigoBuscar = '';
    this.zonaBuscar = '';
    this.aplicarFiltros();
  }

  eliminar(id?: number): void {
    if (!id) return;
    this.modalService.open({
      message: '¿Eliminar ubicación? Esto podría fallar si tiene stock asociado.', 
      title: 'Eliminar', 
      confirmText: 'Eliminar',
      showCancelButton: true,
      onConfirm: () => this.onConfirm(id)
    });
  }

  onConfirm = (id: number) => {
    this.ubicacionService.eliminar(id).subscribe({
      next: (res) => {
        const msg = typeof res === 'string' ? res : 'Ubicación eliminada correctamente.';
        this.showModal(msg, 'Éxito');
        this.refresh();
      },
      error: (err) => {
        console.error(err);
        let msg = 'Error al eliminar la ubicación.';
        
        if (err.error) {
            if (typeof err.error === 'string') {
                try {
                    const parsed = JSON.parse(err.error);
                    msg = parsed.error || parsed.message || err.error;
                } catch {
                    msg = err.error;
                }
            } else if (err.error.message || err.error.error) {
                msg = err.error.message || err.error.error;
            }
        }
        this.showModal(msg, 'Error');
      }
    });
  }

  verReporte(): void {
    this.reporte = this.ubicacionesOriginal.map(u => ({
      idUbicacion: u.idUbicacion,
      codigo: u.codigo,
      zonaNombre: u.zona?.nombre || 'Sin Zona',
      capacidadMaxima: u.capacidadMaxima,
      ocupadoActual: u.ocupadoActual,
      espacioDisponible: u.capacidadMaxima - u.ocupadoActual
    }));
    this.mostrandoReporte = true;
  }

  volverLista(): void {
    this.mostrandoReporte = false;
  }

  private showModal(message: string, title: string): void {
    this.modalService.open({ title, message, confirmText: 'Aceptar' });
  }
}