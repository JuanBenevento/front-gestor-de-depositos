import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/Producto/producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = 'http://localhost:8080/GestorDeDepositos/producto';

  constructor(private http: HttpClient) {}

  listar(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/todos`);
  }

  buscarPorId(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/buscar?id=${id}`);
  }

  crear(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(`${this.apiUrl}/crearProducto`, producto);
  }

  actualizar(producto: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/actualizarProducto`, producto);
  }

  borrar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eliminarProducto?id=${id}`, { responseType: 'text' });
  }

  buscarPorCodigoSku(codigoSku: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/buscarPorCodigoSku?codigo=${codigoSku}`);
  }

  buscarPorNombreOCodigo(valor: string): Observable<Producto[]> {
  return this.http.get<Producto[]>(`${this.apiUrl}/buscarPorNombreOCodigo?valor=${valor}`);
}
}
