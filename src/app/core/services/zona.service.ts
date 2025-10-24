import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Zona } from '../models/zona/zona.model';

@Injectable({
  providedIn: 'root'
})
export class ZonaService { 
  private baseUrl = 'http://localhost:8080/GestorDeDepositos/zona';

  constructor(private http: HttpClient) {}

  listar(): Observable<Zona[]> {
    return this.http.get<Zona[]>(`${this.baseUrl}/buscarTodos`);
  }

  buscarPorId(id: number): Observable<Zona> {
  return this.http.get<Zona>(`${this.baseUrl}/buscarPorId?id=${id}`);
  }


  crear(zona: Zona): Observable<Zona> {
    return this.http.post<Zona>(`${this.baseUrl}/crearZona`, zona);
  }

  actualizar(zona: Zona): Observable<Zona> {
  return this.http.put<Zona>(`${this.baseUrl}/actualizarZona/${zona.idZona}`, zona);
  } 

  eliminar(id: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}/eliminarZona?id=${id}`, {
    responseType: 'text' as 'json'
  });
}
}
