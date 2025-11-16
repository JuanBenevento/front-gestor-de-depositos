import { Component, OnInit } from '@angular/core';
import { MovimientosInventarioService } from '../../../core/services/movimientos-inventario.service';
import { Router } from '@angular/router';
import { MovimientoInventario } from '../../../core/models/movimiento-inventario/movimiento-inventario.module';

@Component({
  selector: 'app-movimientos-list',
  imports: [],
  templateUrl: './movimientos-list.html',
  styleUrl: './movimientos-list.css'
})
export class MovimientosList implements OnInit {

  movimientos: MovimientoInventario[] = [];
  loading = true;
  error = '';
  idBuscar: string = '';
  filtrado = false;

  constructor(
    private service: MovimientosInventarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    throw new Error('Method not implemented.');
  }
}
