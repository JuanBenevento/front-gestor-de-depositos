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
  usuariosOriginal: Usuario[] = [];
  loading = true;
  error = '';
  nombreUsuarioBuscar: string = ''; 
  nombreRolBuscar: string = '';     
  filtrado = false; 

  private rolMap: { [key: number]: string } = {
    1: 'ADMIN',
    2: 'OPERATIVO',
  };
  
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
    this.nombreUsuarioBuscar = ''; 
    this.nombreRolBuscar = '';     
    this.filtrado = false; 

    this.usuarioService.listar().subscribe({
      next: data => {
        this.usuariosOriginal = data; 
        this.usuarios = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar usuarios.';
        this.loading = false;
      }
    });
  }

  limpiarFiltros(): void {
    this.nombreUsuarioBuscar = '';
    this.nombreRolBuscar = '';
    this.aplicarFiltros(); 
    this.filtrado = false;
    this.error = '';
  }

  getRoleName(idRol: number | undefined): string {
    if (idRol === undefined) {
      return 'N/A';
    }
    return this.rolMap[idRol] || `ID Desconocido (${idRol})`;
  }

  aplicarFiltros(): void {
    let usuariosFiltrados = this.usuariosOriginal;
    
    const nombreUsuario = this.nombreUsuarioBuscar?.toLowerCase().trim();
    const nombreRol = this.nombreRolBuscar?.toLowerCase().trim();

    if (nombreUsuario && nombreUsuario.length > 0) {
      usuariosFiltrados = usuariosFiltrados.filter(u =>
        u.nombre.toLowerCase().includes(nombreUsuario) ||
        u.apellido.toLowerCase().includes(nombreUsuario) ||
        u.email.toLowerCase().includes(nombreUsuario)
      );
    }

    if (nombreRol && nombreRol.length > 0) {
      usuariosFiltrados = usuariosFiltrados.filter(u => {
        const rolActual = this.getRoleName(u.idRol).toLowerCase(); 
        return rolActual.includes(nombreRol);
      });
    }
    
    this.usuarios = usuariosFiltrados;
    this.filtrado = !!nombreUsuario || !!nombreRol;
    this.error = this.filtrado && this.usuarios.length === 0 ? 'No se encontraron usuarios con los criterios de búsqueda.' : '';
  }


  eliminar(id: number): void {
    this.modalService.open({message: '¿Eliminar usuario?', title: 'Eliminar', onConfirm: () => this.onConfirm(id)});
  }

  onConfirm = (id: number) => {
    this.usuarioService.eliminar(id).subscribe({
      next: (mensajeRespuesta) => {
        this.showModal(mensajeRespuesta, 'Éxito'); 
        this.refresh();
      },
      error: (err) => {
        console.error(err);
        this.showModal('Error al eliminar el usuario.', 'Error');
      }
    });
  }

  private showModal(message: string, title = 'Informacion'): void {
    this.modalService.open({ title, message, confirmText: 'Aceptar' });
  }
}
