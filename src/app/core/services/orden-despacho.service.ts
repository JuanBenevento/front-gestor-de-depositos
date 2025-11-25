import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import OrdenDespacho from '../models/orden-despacho/orden-despacho.model';

@Injectable({
  providedIn: 'root'
})
export class OrdenDespachoService {

  private apiUrl = 'http://localhost:8080/GestorDeDepositos/ordenesDeDespacho';

  constructor(private http: HttpClient) {}

  listar(): Observable<OrdenDespacho[]> {
    return this.http.get<OrdenDespacho[]>(`${this.apiUrl}/buscarTodos`);
  }

  buscarPorId(id: number): Observable<OrdenDespacho> {
    return this.http.get<OrdenDespacho>(`${this.apiUrl}/buscarPorId/${id}`);
  }

  crear(orden: OrdenDespacho): Observable<OrdenDespacho> {
    return this.http.post<OrdenDespacho>(`${this.apiUrl}/crearOrden`, orden);
  }

  actualizar(id: number, orden: OrdenDespacho): Observable<OrdenDespacho> {
    return this.http.put<OrdenDespacho>(`${this.apiUrl}/actualizarOrdenCompleta?id=${id}`, orden);
  }

  eliminar(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/eliminarOrden?id=${id}`, { responseType: 'text' });
  }
}
