import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BASE_URL } from '../constants/baseUrl';

@Injectable({
  providedIn: 'root'
})
export class MovimientosInventarioService {

  constructor(
    private http: HttpClient
  ) { }

  private readonly apiUrl = `${BASE_URL}/movimientoInventario`;

  listar() {
    return this.http.get(`${this.apiUrl}/todos`);
  }

  buscarPorId(id: number) {
    return this.http.get(`${this.apiUrl}/buscar?id=${id}`);
  }

  crear(movimiento: any) {
    return this.http.post(`${this.apiUrl}/crearMovimiento`, movimiento);
  }

  actualizar(movimiento: any) {
    return this.http.put(`${this.apiUrl}/editar?id=${movimiento?.id_movimiento}`, movimiento);
  }

  borrar(id: number) {
    return this.http.delete(`${this.apiUrl}/eliminar?id=${id}`, { responseType: 'text' });
  }
}
