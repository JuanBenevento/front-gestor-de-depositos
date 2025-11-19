import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BASE_URL } from '../constants/baseUrl';
import { Observable } from 'rxjs';
import { MovimientoInventario } from '../models/movimiento-inventario/movimiento-inventario.module';

@Injectable({
  providedIn: 'root'
})
export class MovimientosInventarioService {

  constructor(
    private http: HttpClient
  ) { }

  private readonly apiUrl = `${BASE_URL}/movimientoInventario`;

  listar(): Observable<MovimientoInventario[]> {
    return this.http.get<MovimientoInventario[]>(`${this.apiUrl}/todos`);
  }

  buscarPorId(id: number): Observable<MovimientoInventario> {
    return this.http.get<MovimientoInventario>(`${this.apiUrl}/buscar?id=${id}`);
  }

  crear(movimiento: any): Observable<MovimientoInventario> {
    return this.http.post<MovimientoInventario>(`${this.apiUrl}/crearMovimiento`, movimiento);
  }

  actualizar(movimiento: any): Observable<MovimientoInventario> {
    return this.http.put<MovimientoInventario>(`${this.apiUrl}/editar?id=${movimiento?.id_movimiento}`, movimiento);
  }

  eliminar(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/eliminar?id=${id}`, { responseType: 'text' });
  }
}
