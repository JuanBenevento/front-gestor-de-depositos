import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ubicacion } from '../models/ubicacion/ubicacion.model';
import { ReporteUbicacion } from '../models/ubicacion/reporte-ubicacion.model';

@Injectable({
  providedIn: 'root'
})
export class UbicacionService {
  private baseUrl = 'http://localhost:8080/GestorDeDepositos/ubicacion';

  constructor(private http: HttpClient) {}

  listar(): Observable<Ubicacion[]> {
    return this.http.get<Ubicacion[]>(`${this.baseUrl}/todos`);
  }

  buscarPorId(id: number): Observable<Ubicacion> {
    return this.http.get<Ubicacion>(`${this.baseUrl}/buscar?id=${id}`);
  }

  crear(ubicacion: Ubicacion): Observable<Ubicacion> {
    return this.http.post<Ubicacion>(`${this.baseUrl}/crear`, ubicacion);
  }

  actualizar(id: number, ubicacion: Ubicacion): Observable<Ubicacion> {
    // El backend espera PUT /actualizar?id=...
    return this.http.put<Ubicacion>(`${this.baseUrl}/actualizar?id=${id}`, ubicacion);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/eliminar?id=${id}`, {
      responseType: 'text' as 'json'
    });
  }

  reporteEspacio(): Observable<ReporteUbicacion[]> {
    return this.http.get<ReporteUbicacion[]>(`${this.baseUrl}/reporte`);
  }
}
