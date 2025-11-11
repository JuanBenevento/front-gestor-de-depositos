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
    return this.http.get<OrdenRecepcion>(`${this.apiUrl}/${id}`);
  }

  crear(detalle: OrdenRecepcion): Observable<OrdenRecepcion> {
    return this.http.post<OrdenRecepcion>(`${this.apiUrl}/crearOrdenRecepcion`, detalle);
  }

  editar(id: number, detalle: OrdenRecepcion): Observable<OrdenRecepcion> {
    return this.http.put<OrdenRecepcion>(`${this.apiUrl}/editar/${id}`, detalle);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/eliminar/${id}`);
  }
}
