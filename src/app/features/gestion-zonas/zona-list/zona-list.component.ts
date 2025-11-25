import { Component, OnInit } from '@angular/core';
import { Zona } from '../../../core/models/zona/zona.model';
import { ZonaService } from '../../../core/services/zona.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../../../shared/services/modal.service';


@Component({
  selector: 'app-zonas-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './zona-list.component.html'
})
export class ZonaListComponent implements OnInit {
  zonas: Zona[] = [];
  zonasOriginal: Zona[] = [];
  loading = true;
  error = '';
  nombreBuscar: string = '';
  filtrado = false;

  constructor(
    private zonaService: ZonaService,
    private router: Router,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.refresh();
  }

 refresh(): void {
    this.loading = true;
    this.error = '';
    this.nombreBuscar = '';
    this.filtrado = false;  

    this.zonaService.listar().subscribe({
      next: data => {
        this.zonasOriginal = data; 
        this.zonas = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar zona.';
        this.loading = false;
      }
    });
  }

  eliminar(id: number): void {
    this.modalService.open({message: '¿Eliminar zona?', title: 'Eliminar', onConfirm: () => this.onConfirm(id)});
  }

  onConfirm = (id: number) => {
    this.zonaService.eliminar(id).subscribe({
      next: () => this.refresh(),
      error: (err) => {
        let message = 'Error al eliminar la zona.';

        if (typeof err.error === 'string') {
          message = err.error;
        } else if (err.error?.error) {
          message = err.error.error; 
        }

        this.showModal(message, 'Error');
      }
    });
  }

  aplicarFiltroNombre(): void {
    const nombre = this.nombreBuscar?.toLowerCase().trim();

    let zonasFiltradas = this.zonasOriginal;
    if (nombre && nombre.length > 0) {
      zonasFiltradas = zonasFiltradas.filter(z => 
        z.nombre.toLowerCase().includes(nombre)
      );
      this.filtrado = true;
    } else {
      this.filtrado = false;
    }

    this.zonas = zonasFiltradas;
    this.error = this.filtrado && this.zonas.length === 0 ? 'No se encontraron zonas con ese nombre.' : '';
  }

  limpiarFiltros(): void {
    this.nombreBuscar = '';
    this.aplicarFiltroNombre(); 
  }

  private showModal(message: string, title = 'Información'): void {
    this.modalService.open({ title, message, confirmText: 'Aceptar' });
  }

}