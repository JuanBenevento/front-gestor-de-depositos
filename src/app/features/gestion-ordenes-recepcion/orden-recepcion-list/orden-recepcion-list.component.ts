import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Servicios y Modelos
import OrdenRecepcion from '../../../core/models/orden-recepcion/orden-recepcion.model';
import { OrdenRecepcionService } from '../../../core/services/orden-recepcion.service';
import { ModalService } from '../../../shared/services/modal.service';
import { EstadoDeOrden } from '../../../core/enums/estados-de-orden.model'; // Importar Enum

@Component({
  selector: 'app-orden-recepcion-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './orden-recepcion-list.component.html'
})
export class OrdenRecepcionListComponent implements OnInit {

  ordenes: OrdenRecepcion[] = [];
  ordenesFiltradas: OrdenRecepcion[] = [];
  
  // Enum para el template
  public EstadoDeOrden = EstadoDeOrden; 

  loading = true;
  error = '';
  
  // 💡 Variables de Filtros
  idBuscar: string = '';
  fechaBuscar: string = '';
  proveedorBuscar: string = ''; // Antes nombreClienteBuscar
  productoBuscar: string = '';
  estadoBuscar: EstadoDeOrden | null = null; // Puede ser null para "Todos"
  
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
    this.limpiarVariablesFiltro(); // Resetear variables

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

  private limpiarVariablesFiltro() {
    this.idBuscar = '';
    this.fechaBuscar = '';
    this.proveedorBuscar = '';
    this.productoBuscar = '';
    this.estadoBuscar = null;
    this.filtrado = false;
  }

  aplicarFiltros(): void {
    const id = this.idBuscar.trim();
    const fecha = this.fechaBuscar;
    const proveedor = this.proveedorBuscar.toLowerCase().trim();
    const producto = this.productoBuscar.toLowerCase().trim();
    const estado = this.estadoBuscar;

    this.ordenesFiltradas = this.ordenes.filter(o => {
      const matchFecha = fecha 
        ? new Date(o.fecha).toISOString().split('T')[0] === fecha 
        : true;

      const matchProveedor = proveedor 
        ? o.proveedor?.nombre?.toLowerCase().includes(proveedor) 
        : true;

      const matchEstado = estado ? o.estado === estado : true;

      const matchProducto = producto 
        ? o.detalleRecepcionDTOList?.some(d => 
            d.producto?.nombre?.toLowerCase().includes(producto) || 
            d.codigoSku?.toLowerCase().includes(producto)
          )
        : true;

      return matchFecha && matchProveedor && matchEstado && matchProducto;
    });

    this.filtrado = !!(id || fecha || proveedor || producto || estado);
  }

  limpiarFiltros(): void {
    this.limpiarVariablesFiltro();
    this.ordenesFiltradas = [...this.ordenes];
  }

  eliminar(id: number): void {
    this.modalService.open({
      message: '¿Eliminar orden de recepción? Esto borrará sus detalles.', 
      title: 'Eliminar', 
      confirmText: 'Eliminar',
      showCancelButton: true,
      onConfirm: () => this.onConfirm(id)
    });
  }

  onConfirm = (id: number) => {
    this.ordenRecepcionService.eliminar(id).subscribe({
      next: (res) => {
        const msg = typeof res === 'string' ? res : 'Orden eliminada correctamente';
        this.showModal(msg, 'Éxito');
        this.refresh();
      },
      error: (error) => {
        console.error('Error:', error);
        this.showModal('Error al eliminar la orden.', 'Error');
      }
    });
  }

  verDetalles(id: number): void {
    this.router.navigate([`/dashboard/ordenesRecepcion/editar/${id}`]);
  }

  private showModal(message: string, title = 'Informacion'): void {
    this.modalService.open({ title, message, confirmText: 'Aceptar' });
  }
}