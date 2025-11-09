import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrdenDespachoService } from '../../../core/services/orden-despacho.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import OrdenDespacho from '../../../core/models/orden-despacho/orden-despacho.model';

@Component({
  selector: 'app-ordenes-despacho-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './gestion-ordenes-despacho-list.component.html'
})
export class OrdenDespachoListComponent implements OnInit {

  ordenes: OrdenDespacho[] = [];
  loading = true;
  error = '';
  idBuscar: string = '';    
  filtrado = false; 

  constructor(
    private ordenDespachoService: OrdenDespachoService,
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

    this.ordenDespachoService.listar().subscribe({
      next: data => {
        this.ordenes = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar ordenes.';
        this.loading = false;
      }
    });
  }


  eliminar(id: number): void {
    if (!confirm('¿Eliminar orden de despacho?')) { return; }
    this.ordenDespachoService.eliminar(id).subscribe({
      next: () => this.refresh(),
      error: () => alert('Error al eliminar')
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
    this.ordenDespachoService.buscarPorId(id).subscribe({
      next: orden => {
        this.ordenes = [orden];      
        this.loading = false;
        this.filtrado = true;
      },
      error: () => {
        this.error = `No se encontro la orden de despacho con ID ${id}.`;
        this.ordenes = [];
        this.loading = false;
      }
    });
  }
}
