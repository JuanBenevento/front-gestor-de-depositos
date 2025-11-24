import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { InventarioService } from '../../../core/services/inventario.service';
import { UbicacionService } from '../../../core/services/ubicacion.service';
import { Inventario } from '../../../core/models/inventario/inventario.model';
import { ModalService } from '../../../shared/services/modal.service';

@Component({
  selector: 'app-inventario-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './inventario-list.component.html'
})
export class InventarioListComponent implements OnInit {

  inventarios: Inventario[] = [];
  inventariosFiltrados: Inventario[] = [];

  ubicaciones: any[] = [];
  filtroUbicacion = new FormControl(null);
  nombreBuscar: string = '';
  skuBuscar: string = '';
  ubicacionBuscar: number | null = null;

  loading = true;
  error = '';

  constructor(
    private service: InventarioService,
    private ubicacionService: UbicacionService,
    private router: Router,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.cargarUbicaciones();
    this.cargarInventarios();

  }

  cargarUbicaciones() {
    this.ubicacionService.listar().subscribe(u => this.ubicaciones = u);
  }

  cargarInventarios() {
    this.loading = true;
    this.service.listar().subscribe({
      next: data => {
        this.inventarios = data;         
        this.inventariosFiltrados = data; 
        this.aplicarFiltros();            
        this.loading = false;
      },
      error: () => {
        this.error = 'Error cargando inventarios';
        this.loading = false;
      }
    });
  }

  aplicarFiltros() {
    let filtrado = this.inventarios;
    const nombre = this.nombreBuscar?.toLowerCase().trim();
    const sku = this.skuBuscar?.toLowerCase().trim();
    const idUbicacion = this.ubicacionBuscar;

    if (nombre) {
      filtrado = filtrado.filter(inv => 
        inv.producto?.nombre?.toLowerCase().includes(nombre)
      );
    }

    if (sku) {
      filtrado = filtrado.filter(inv => 
        inv.producto?.codigoSku?.toLowerCase().includes(sku)
      );
    }

    if (idUbicacion) {
      filtrado = filtrado.filter(inv => 
        inv.ubicacion?.idUbicacion === idUbicacion
      );
    }

    this.inventariosFiltrados = filtrado;
  }

  eliminar(id: number) {
    this.modalService.open({
      title: 'Eliminar inventario',
      message: '¿Eliminar inventario?',
      confirmText: 'Eliminar',
      showCancelButton: true,
      onConfirm: () => this.confirmarEliminacion(id)
    });
  }

  private confirmarEliminacion(id: number): void {
    this.service.eliminar(id).subscribe({
      next: () => {
        this.cargarInventarios();
        this.showModal('Inventario eliminado correctamente.', 'Operación exitosa');
      },
      error: () => this.showModal('Error al eliminar inventario', 'Error')
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

}
