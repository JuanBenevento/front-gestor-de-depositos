import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UsuarioService } from '../../../core/services/usuario.service';
import { Usuario } from '../../../core/models/usuario/usuario.model';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../../../shared/services/modal.service';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './usuario-list.component.html'
})
export class UsuarioListComponent implements OnInit {

  usuarios: Usuario[] = [];
  loading = true;
  error = '';
  idBuscar: string = '';
  rolBuscar = '';      
  filtrado = false; 

  constructor(
    private usuarioService: UsuarioService,
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
    this.rolBuscar = '';
    this.filtrado = false; 

    this.usuarioService.listar().subscribe({
      next: data => {
        this.usuarios = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar usuarios.';
        this.loading = false;
      }
    });
  }


  eliminar(id: number): void {
    this.modalService.open({message: '¿Eliminar usuario?', title: 'Eliminar', onConfirm: () => this.onConfirm(id)});
  }

  onConfirm = (id: number) => {
    this.usuarioService.eliminar(id).subscribe({
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
    this.usuarioService.buscarPorId(id).subscribe({
      next: usuario => {
        this.usuarios = [usuario];      
        this.loading = false;
        this.filtrado = true;
      },
      error: () => {
        this.error = `No se encontró el usuario con ID ${id}.`;
        this.usuarios = [];
        this.loading = false;
      }
    });
  }

  buscarPorRol(): void {
    const rol = +this.rolBuscar;
    if (!rol) { return; }

    this.error = '';
    this.loading = true;

    this.usuarioService.buscarPorRol(rol).subscribe({
      next: lista => {
        this.usuarios = lista;
        this.loading = false;
        this.filtrado = true;
        if (!lista.length) {
          this.error = `No se encontraron usuarios con rol ${rol}.`;
        }
      },
      error: () => {
        this.error = 'Error al buscar por rol.';
        this.loading = false;
      }
    });
  }

  private showModal(message: string, title = 'Informacion'): void {
    this.modalService.open({ title, message, confirmText: 'Aceptar' });
  }
}
