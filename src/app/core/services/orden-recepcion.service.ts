import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';

import { BASE_URL } from '../constants/baseUrl';
import OrdenRecepcion from '../models/orden-recepcion/orden-recepcion.model';

@Injectable({
  providedIn: 'root'
})
export class OrdenRecepcionService {

  private apiUrl = `${BASE_URL}/ordenes`;

  constructor(private http: HttpClient) {}

  listar(): Observable<OrdenRecepcion[]> {
    return this.http.get<OrdenRecepcion[]>(`${this.apiUrl}/todos`);
  }

  buscarPorId(id: number): Observable<OrdenRecepcion> {
    return this.http.get<OrdenRecepcion>(`${this.apiUrl}/buscar?id=${id}`);
  }

  crear(detalle: OrdenRecepcion): Observable<OrdenRecepcion> {
    return this.http.post<OrdenRecepcion>(`${this.apiUrl}/crearOrdenRecepcionCabecera`, detalle);
  }

  editar(id: number, estado: string): Observable<OrdenRecepcion> {
    return this.http.put<OrdenRecepcion>(`${this.apiUrl}/actualizarEstadoOrden?idOrden=${id}&estado=${estado}`, {});
  }

  eliminar(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/eliminarOrden?idOrden=${id}`, { 
      responseType: 'text' 
    });
  }
}
