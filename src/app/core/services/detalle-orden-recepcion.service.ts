import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { DetalleRecepcion } from '../models/orden-recepcion/detalle-recepcion.model';
import { BASE_URL } from '../constants/baseUrl';

@Injectable({
  providedIn: 'root'
})
export class DetalleOrdenRecepcionService {

  private apiUrl = `${BASE_URL}/detalle-orden-recepcion`;

    constructor(private http: HttpClient) {}

  listar(): Observable<DetalleRecepcion[]> {
    return this.http.get<DetalleRecepcion[]>(`${this.apiUrl}/todos`);
  }

  buscarPorId(id: number): Observable<DetalleRecepcion> {
    return this.http.get<DetalleRecepcion>(`${this.apiUrl}/buscarDetallePorId?id=${id}`);
  }
  buscarPorIdOrden(id: number): Observable<DetalleRecepcion> {
    return this.http.get<DetalleRecepcion>(`${this.apiUrl}/buscarDetallesPorIdOrden?id=${id}`);
  }

  crear(detalle: DetalleRecepcion): Observable<DetalleRecepcion> {
    return this.http.post<DetalleRecepcion>(`${this.apiUrl}/crearDetalleRecepcion`, detalle);
  }

  editar(id: number, detalle: DetalleRecepcion): Observable<DetalleRecepcion> {
    return this.http.put<DetalleRecepcion>(`${this.apiUrl}/actualizarDetalle?id=${id}`, detalle);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/eliminarDetalleConIdDet?id=${id}`);
  }
}
