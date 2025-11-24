import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { DetalleRecepcionDTO } from '../models/orden-recepcion/detalle-recepcion.model';
import { BASE_URL } from '../constants/baseUrl';

@Injectable({
  providedIn: 'root'
})
export class DetalleOrdenRecepcionService {

  private apiUrl = `${BASE_URL}/detalleRecepcion`;

    constructor(private http: HttpClient) {}

  listar(): Observable<DetalleRecepcionDTO[]> {
    return this.http.get<DetalleRecepcionDTO[]>(`${this.apiUrl}/todos`);
  }

  buscarPorId(id: number): Observable<DetalleRecepcionDTO> {
    return this.http.get<DetalleRecepcionDTO>(`${this.apiUrl}/buscarDetallePorId?id=${id}`);
  }
  buscarPorIdOrden(id: number): Observable<DetalleRecepcionDTO> {
    return this.http.get<DetalleRecepcionDTO>(`${this.apiUrl}/buscarDetallesPorIdOrden?idOrden=${id}`);
  }

  crear(detalles: DetalleRecepcionDTO): Observable<DetalleRecepcionDTO> {
    return this.http.post<DetalleRecepcionDTO>(`${this.apiUrl}/crearDetallesRecepcion`, detalles);
  }

  editar(id: number, detalle: DetalleRecepcionDTO): Observable<DetalleRecepcionDTO> {
    return this.http.put<DetalleRecepcionDTO>(`${this.apiUrl}/actualizarDetalle?id=${id}`, detalle);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/eliminarDetalleConIdDet?id=${id}`);
  }
}
