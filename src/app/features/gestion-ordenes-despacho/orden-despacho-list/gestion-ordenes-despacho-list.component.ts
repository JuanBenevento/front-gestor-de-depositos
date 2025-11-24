import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrdenDespachoService } from '../../../core/services/orden-despacho.service';
import OrdenDespacho from '../../../core/models/orden-despacho/orden-despacho.model';
import { ModalService } from '../../../shared/services/modal.service';
import { EstadoDeOrden } from '../../../core/enums/estados-de-orden.model';

@Component({
  selector: 'app-ordenes-despacho-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './gestion-ordenes-despacho-list.component.html'
})
export class OrdenDespachoListComponent implements OnInit {

  ordenes: OrdenDespacho[] = [];
  ordenesFiltradas: OrdenDespacho[] = [];
  public EstadoDeOrden = EstadoDeOrden;

  loading = true;
  error = '';
  
  // FILTROS
  idBuscar: string = '';
  nombreClienteBuscar: string = '';
  productoBuscar: string = '';
  fechaBuscar: string = '';
  estadoBuscar: EstadoDeOrden | null = null;
  
  filtrado = false;

  constructor(
    private ordenDespachoService: OrdenDespachoService,
    private router: Router,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.error = '';
    this.limpiarVariables();

    this.ordenDespachoService.listar().subscribe({
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

  private limpiarVariables() {
    this.idBuscar = '';
    this.nombreClienteBuscar = '';
    this.productoBuscar = '';
    this.fechaBuscar = '';
    this.estadoBuscar = null;
    this.filtrado = false;
  }

  aplicarFiltros(): void {
    const idFiltro = this.idBuscar.trim();
    const clienteFiltro = this.nombreClienteBuscar.trim().toLowerCase();
    const productoFiltro = this.productoBuscar.trim().toLowerCase();
    const fechaFiltro = this.fechaBuscar;
    const estadoFiltro = this.estadoBuscar;

    this.ordenesFiltradas = this.ordenes.filter(o => {
      const matchCliente = clienteFiltro 
        ? (o.cliente?.nombre || '').toLowerCase().includes(clienteFiltro)
        : true;

      const matchFecha = fechaFiltro
        ? new Date(o.fechaDespacho).toISOString().split('T')[0] === fechaFiltro
        : true;

      const matchEstado = estadoFiltro ? o.estado === estadoFiltro : true;

      const matchProducto = productoFiltro 
        ? o.detalle_despacho?.some(d => 
            d.producto?.nombre?.toLowerCase().includes(productoFiltro) || 
            d.producto?.codigoSku?.toLowerCase().includes(productoFiltro)
          )
        : true;

      return matchCliente && matchFecha && matchEstado && matchProducto;
    });

    this.filtrado = !!(idFiltro || clienteFiltro || productoFiltro || fechaFiltro || estadoFiltro);
  }

  limpiarFiltros(): void {
    this.limpiarVariables();
    this.ordenesFiltradas = [...this.ordenes];
  }

  eliminar(id: number): void {
    this.modalService.open({
      message: '¿Eliminar orden de despacho? Se repondrá el stock.', 
      title: 'Eliminar', 
      confirmText: 'Eliminar',
      showCancelButton: true,
      onConfirm: () => this.onConfirm(id)
    });
  }

  onConfirm = (id: number) => {
    this.ordenDespachoService.eliminar(id).subscribe({
      next: (res) => {
        const msg = typeof res === 'string' ? res : 'Orden eliminada y stock repuesto.';
        this.showModal(msg, 'Éxito');
        this.refresh();
      },
      error: (err) => {
        console.error(err);
        let msg = 'Error al eliminar.';
        if (err.error && typeof err.error === 'string') msg = err.error;
        else if (err.error?.message) msg = err.error.message;
        this.showModal(msg, 'Error');
      }
    });
  }

  private showModal(message: string, title = 'Informacion'): void {
    this.modalService.open({ title, message, confirmText: 'Aceptar' });
  }
}