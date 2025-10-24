import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private baseUrl = 'http://localhost:8080/GestorDeDepositos/usuarios';

  constructor(private http: HttpClient) {}

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.baseUrl}/buscarTodosLosUsuarios`);
  }

  buscarPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/buscarUsuario?idUsuario=${id}`);
  }

  crear(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.baseUrl}/crearUsuario`, usuario);
  }

  actualizar(usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.baseUrl}/modificarUsuario`, usuario);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/eliminarUsuario?idUsuario=${id}`);
  }

  buscarPorRol(idRol: number): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.baseUrl}/buscarPorRol?idRol=${idRol}`);
  }
}
