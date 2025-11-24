import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { ProveedoresService } from '../../../core/services/proveedores.service';
import { Proveedor } from '../../../core/models/proveedor/proveedor.model';
import { ModalService } from '../../../shared/services/modal.service';

@Component({
  selector: 'app-proveedores-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './proveedores-list.component.html'
})
export class ProveedoresListComponent implements OnInit {
  proveedores: Proveedor[] = [];
  proveedoresOriginal: Proveedor[] = [];
  loading = true;
  error = '';
  nombreBuscar: string = '';
  filtrado = false;

  constructor(
    private service: ProveedoresService,
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

    this.service.listar().subscribe({
      next: data => {
        this.proveedoresOriginal = data;
        this.proveedores = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar proveedores.';
        this.loading = false;
      }
    });
  }

  volver(): void {
    this.router.navigate(['/dashboard']);
  }

  eliminar(id: number): void {
    this.modalService.open({ 
      title: 'Eliminar', 
      message: '¿Eliminar proveedor?', 
      confirmText: 'Aceptar', 
      onConfirm: () => this.onConfirm(id), 
      showCancelButton: true,
      cancelText: 'Cancelar' 
    });
  }

  onConfirm = (id: number) => {
    this.service.eliminar(id).subscribe({
      next: (res) => {
        this.showModal('El proveedor se elimino correctamente.', 'Exito');
        this.refresh();
        } ,
        error: () => this.showModal('Error al eliminar', 'Error')
      });
  }

  aplicarFiltros(): void {
    const termino = this.nombreBuscar?.toLowerCase().trim();

    let proveedoresFiltrados = this.proveedoresOriginal;

    if (termino && termino.length > 0) {
      proveedoresFiltrados = proveedoresFiltrados.filter(p => 
        p.nombre.toLowerCase().includes(termino)
      );
      this.filtrado = true;
    } else {
      this.filtrado = false;
    }

    this.proveedores = proveedoresFiltrados;
    this.error = this.filtrado && this.proveedores.length === 0 
      ? 'No se encontraron proveedores con ese nombre.' 
      : '';
  }

  limpiarFiltros(): void {
    this.nombreBuscar = '';
    this.aplicarFiltros(); 
  }

  private showModal(message: string, title = 'Informacion'): void {
    this.modalService.open({ title, message, confirmText: 'Aceptar' });
  }

}
