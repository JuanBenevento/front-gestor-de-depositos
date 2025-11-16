import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, switchMap, startWith } from 'rxjs/operators';

import { InventarioService } from '../../../core/services/inventario.service';
import { UbicacionService } from '../../../core/services/ubicacion.service';
import { Inventario } from '../../../core/models/inventario/inventario.model';

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
    private router: Router
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
    if (!confirm('¿Eliminar inventario?')) return;

    this.service.eliminar(id).subscribe({
      next: () => this.cargarInventarios(),
      error: () => alert('Error al eliminar inventario')
    });
  }

  volver() {
    this.router.navigate(['/dashboard']);
  }
}
