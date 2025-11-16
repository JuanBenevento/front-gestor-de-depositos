import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClienteService } from '../../../core/services/cliente.service';
import { Cliente } from '../../../core/models/cliente/cliente.model';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../../../shared/services/modal.service';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cliente-list.component.html'
})
export class ClienteListComponent implements OnInit {

  clientes: Cliente[] = [];
  loading = true;
  error = '';
  idBuscar: string = '';  
  filtrado = false; 

  constructor(
    private clienteService: ClienteService,
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

    this.clienteService.listar().subscribe({
      next: data => {
        this.clientes = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar clientes.';
        this.loading = false;
      }
    });
  }

  onConfirm(id: number): void {
    this.clienteService.eliminar(id).subscribe({
      next: () => {
        this.showModal('Cliente eliminado correctamente', 'Éxito');
        this.refresh();
      },
      error: (err) => {
        console.error('Error al eliminar cliente', err);
        this.showModal('Error al eliminar cliente', 'Error');
      }
    });
  }

  eliminar(id: number): void {
    this.modalService.open({ 
      title: 'Eliminar', 
      message: '¿Seguro que deseas eliminar este cliente?', 
      confirmText: 'Aceptar', 
      onConfirm: () => this.onConfirm(id),
      showCancelButton: true,
      cancelText: 'Cancelar'
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
    this.clienteService.buscarPorId(id).subscribe({
      next: cliente => {
        this.clientes = [cliente];      
        this.loading = false;
        this.filtrado = true;
      },
      error: () => {
        this.error = `No se encontro el cliente con ID ${id}.`;
        this.clientes = [];
        this.loading = false;
      }
    });
  }

  private showModal(message: string, title = 'Informacion'): void {
    this.modalService.open({ title, message, confirmText: 'Aceptar' });
  }

}
