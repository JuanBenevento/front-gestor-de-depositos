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
  loading = true;
  error = '';
  idBuscar: string = '';
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
    this.idBuscar = ''; 
    this.filtrado = false;  

    this.zonaService.listar().subscribe({
      next: data => {
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
      error: () => this.showModal('Error al eliminar', 'Error')
    });
  }

  volver(): void {
    this.router.navigate(['/dashboard']);
  }

  buscarPorId(): void {
    const id = +this.idBuscar;
    if (!id) { return; }
    this.error = '';
    this.loading = true;
    this.zonaService.buscarPorId(id).subscribe({
      next: data => {
        this.zonas = [data];
        this.loading = false;
        this.filtrado = true;
      },
      error: () => {
        this.error = 'Zona no encontrada.';
        this.loading = false;
      } 
    });
  }

  limpiarFiltro(): void {
    this.idBuscar = '';
    this.filtrado = false;
    this.refresh();
  }

  private showModal(message: string, title = 'Información'): void {
    this.modalService.open({ title, message, confirmText: 'Aceptar' });
  }

}