import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrdenDespachoService } from '../../../core/services/orden-despacho.service';
import OrdenDespacho from '../../../core/models/orden-despacho/orden-despacho.model';

@Component({
  selector: 'app-ordenes-despacho-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './gestion-ordenes-despacho-list.component.html'
})
export class OrdenDespachoListComponent implements OnInit {

  ordenes: OrdenDespacho[] = [];
  ordenesFiltradas: OrdenDespacho[] = [];

  loading = true;
  error = '';
  idBuscar: string = '';
  nombreClienteBuscar: string = '';
  fechaBuscar: string = '';
  filtrado = false;

  constructor(
    private ordenDespachoService: OrdenDespachoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.error = '';
    this.idBuscar = '';
    this.nombreClienteBuscar = '';
    this.fechaBuscar = '';
    this.filtrado = false;

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

  aplicarFiltros(): void {
  const idFiltro = (this.idBuscar ?? '').toString().trim();
  const nombreFiltro = (this.nombreClienteBuscar ?? '').trim().toLowerCase();
  const fechaFiltro = this.fechaBuscar;

  this.ordenesFiltradas = this.ordenes.filter(o => {
    const coincideId = idFiltro ? (o.idOrdenDespacho?.toString() || '').includes(idFiltro) : true;

    const coincideNombre = nombreFiltro
      ? (o.cliente?.nombre || '').toLowerCase().includes(nombreFiltro)
      : true;

    const coincideFecha = fechaFiltro
      ? new Date(o.fechaDespacho).toISOString().split('T')[0] === fechaFiltro
      : true;

    return coincideId && coincideNombre && coincideFecha;
  });

  this.filtrado = !!(idFiltro || nombreFiltro || fechaFiltro);
}

  limpiarFiltros(): void {
    this.idBuscar = '';
    this.nombreClienteBuscar = '';
    this.fechaBuscar = '';
    this.ordenesFiltradas = [...this.ordenes];
    this.filtrado = false;
  }

  eliminar(id: number): void {
    if (!confirm('¿Eliminar orden de despacho?')) { return; }
    this.ordenDespachoService.eliminar(id).subscribe({
      next: () => this.refresh(),
      error: () => alert('Error al eliminar la orden.')
    });
  }

  volver(): void {
    this.router.navigate(['/dashboard']);
  }
}
