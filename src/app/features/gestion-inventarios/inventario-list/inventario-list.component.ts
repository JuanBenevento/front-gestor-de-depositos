import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, switchMap, startWith } from 'rxjs/operators';

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
  busquedaSKU = new FormControl('');

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

    // BUSQUEDA + FILTRO DE UBICACIÓN
    this.busquedaSKU.valueChanges
      .pipe(
        startWith(''),
        debounceTime(300),
        switchMap(() => this.service.listar())
      )
      .subscribe({
        next: data => this.aplicarFiltros(data),
        error: () => this.error = 'Error cargando inventarios'
      });

    this.filtroUbicacion.valueChanges.subscribe(() => {
      this.aplicarFiltros(this.inventarios);
    });
  }

  cargarUbicaciones() {
    this.ubicacionService.listar().subscribe(u => this.ubicaciones = u);
  }

  cargarInventarios() {
    this.service.listar().subscribe({
      next: data => {
        this.inventarios = data;
        this.aplicarFiltros(data);
        this.loading = false;
      },
      error: () => {
        this.error = 'Error cargando inventarios';
        this.loading = false;
      }
    });
  }

  aplicarFiltros(data: Inventario[]) {
    const sku = this.busquedaSKU.value?.trim().toLowerCase() || '';
    const ubicacionId = this.filtroUbicacion.value;

    this.inventariosFiltrados = data.filter(inv => {
      const coincideSKU = sku
        ? inv.ubicacion.codigo?.toLowerCase().includes(sku) ||
          inv.producto.nombre?.toLowerCase().includes(sku)
        : true;

      const coincideUbicacion = ubicacionId
        ? inv.ubicacion.idUbicacion === ubicacionId
        : true;

      return coincideSKU && coincideUbicacion;
    });
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

  volver() {
    this.router.navigate(['/dashboard']);
  }
}
