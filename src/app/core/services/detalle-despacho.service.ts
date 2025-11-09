import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DetalleDespacho } from '../models/orden-despacho/detalle-despacho.model';

@Injectable({
  providedIn: 'root'
})
export class DetalleDespachoService {
  private apiUrl = 'http://localhost:8080/GestorDeDepositos/detalleDespacho';

  constructor(private http: HttpClient) {}

  listar(): Observable<DetalleDespacho[]> {
    return this.http.get<DetalleDespacho[]>(`${this.apiUrl}/listar`);
  }

  buscarPorId(id: number): Observable<DetalleDespacho> {
    return this.http.get<DetalleDespacho>(`${this.apiUrl}/${id}`);
  }

  crear(detalle: DetalleDespacho): Observable<DetalleDespacho> {
    return this.http.post<DetalleDespacho>(`${this.apiUrl}/crear`, detalle);
  }

  editar(id: number, detalle: DetalleDespacho): Observable<DetalleDespacho> {
    return this.http.put<DetalleDespacho>(`${this.apiUrl}/editar/${id}`, detalle);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/eliminar/${id}`);
  }
}
