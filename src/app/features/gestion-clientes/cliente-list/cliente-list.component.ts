import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClienteService } from '../../../core/services/cliente.service';
import { Cliente } from '../../../core/models/cliente/cliente.model';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cliente-list.component.html',
  styleUrls: ['./cliente-list.component.css']
})
export class ClienteListComponent implements OnInit {

  clientes: Cliente[] = [];
  loading = true;
  error = '';
  idBuscar: string = '';  
  filtrado = false; 

  constructor(
    private clienteService: ClienteService,
    private router: Router
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


 eliminar(id: number): void {
    if (confirm('¿Seguro que deseas eliminar este cliente?')) {
      this.clienteService.eliminar(id).subscribe({
        next: () => {
          alert('Cliente eliminado correctamente');
          this.refresh();
        },
        error: (err) => {
          console.error('Error al eliminar cliente', err);
          alert('Error al eliminar cliente');
        }
      });
    }
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

}
