import { Component } from '@angular/core';
import OrdenRecepcion from '../../../core/models/orden-recepcion/orden-recepcion.model';
import { OrdenRecepcionService } from '../../../core/services/orden-recepcion.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../../../shared/services/modal.service';

@Component({
  selector: 'app-orden-recepcion-list',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './orden-recepcion-list.component.html'
})
export class OrdenRecepcionListComponent {

  ordenes: OrdenRecepcion[] = [];
  ordenesFiltradas: OrdenRecepcion[] = [];

  loading = true;
  error = '';
  idBuscar: string = '';
  nombreClienteBuscar: string = '';
  fechaBuscar: string = '';
  filtrado = false;

  constructor(
    private ordenRecepcionService: OrdenRecepcionService,
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
    this.fechaBuscar = '';
    this.filtrado = false;

    this.ordenRecepcionService.listar().subscribe({
      next: data => {
        this.ordenes = data;
        this.ordenesFiltradas = [...data];
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar órdenes.';
        this.loading = false;
      }
    });
  }

  aplicarFiltros(): void {
  const idFiltro = (this.idBuscar ?? '').toString().trim();
  const fechaFiltro = this.fechaBuscar;

  this.ordenesFiltradas = this.ordenes.filter(o => {
    const coincideId = idFiltro ? (o.id_orden_recepcion?.toString() || '').includes(idFiltro) : true;

    const coincideFecha = fechaFiltro
      ? new Date(o.fecha).toISOString().split('T')[0] === fechaFiltro
      : true;

    return coincideId && coincideFecha;
  });

  this.filtrado = !!(idFiltro || fechaFiltro);
}

  limpiarFiltros(): void {
    this.idBuscar = '';
    this.fechaBuscar = '';
    this.ordenesFiltradas = [...this.ordenes];
    this.filtrado = false;
  }

  onConfirm = (id: number) => {
    this.ordenRecepcionService.eliminar(id).subscribe({
      next: (response) => {
        console.log('Orden eliminada:', response);
        this.showModal('Orden eliminada correctamente', 'Éxito');
        this.refresh();
      },
      error: (error) => {
        console.error('Error al eliminar orden:', error);
        this.showModal('Error al eliminar la orden.', 'Error');
      }
    });
  }

  eliminar(id: number): void {
    this.modalService.open({message: '¿Eliminar orden de recepción?', title: 'Eliminar', onConfirm: () => this.onConfirm(id)});
  }

  volver(): void {
    this.router.navigate(['/dashboard']);
  }

  verDetalles(id: number): void {
    this.router.navigate([`/dashboard/ordenesRecepcion/editar/${id}`]);
  }

  private showModal(message: string, title = 'Informacion'): void {
    this.modalService.open({ title, message, confirmText: 'Aceptar' });
  }
}
