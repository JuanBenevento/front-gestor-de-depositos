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
  loading = true;
  error = '';
  idBuscar: string = '';
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
    this.idBuscar = ''; 
    this.filtrado = false;  

    this.service.listar().subscribe({
      next: data => {
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
        this.showModal('El proveedor se eliminó correctamente.', 'Éxito');
        this.refresh();
        } ,
        error: () => this.showModal('Error al eliminar', 'Error')
      });
  }
 
  

  buscarPorId(): void {
    const id  = +this.idBuscar;
    if (!id) { return; }
    this.error = '';
    this.loading = true;
    this.service.buscarPorId(id).subscribe({
      next: data => {
        this.proveedores = [data];
        this.loading = false;
        this.filtrado = true;
      },
      error: () => {
        this.error = 'Proveedor no encontrado.';
        this.loading = false;
      } 
    });
  }

  limpiarFiltro(): void {
    this.idBuscar = '';
    this.filtrado = false;
    this.refresh();
  }

  private showModal(message: string, title = 'Informacion'): void {
    this.modalService.open({ title, message, confirmText: 'Aceptar' });
  }

}
