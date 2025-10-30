import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../models/cliente/cliente.model';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private baseUrl = 'http://localhost:8080/GestorDeDepositos/cliente';

  constructor(private http: HttpClient) {}

  listar(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.baseUrl}/buscarTodos`);
  }

  buscarPorId(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.baseUrl}/buscarPorId?id=${id}`);
  }

  crear(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.baseUrl}/crearCliente`, cliente);
  }

  actualizar(id: number, cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.baseUrl}/actualizarCliente/${id}`, cliente);
  }

  eliminar(id: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}/eliminarCliente?id=${id}`, { responseType: 'text' });
}
}