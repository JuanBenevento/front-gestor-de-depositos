import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Inventario } from '../models/inventario/inventario.model';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {

  private apiUrl = 'http://localhost:8080/GestorDeDepositos/inventario';

  constructor(private http: HttpClient) {}


  obtenerStockPorProductoPorId(idProducto: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stockTotalPorIdProducto/${idProducto}`);
  }

  obtenerStockPorProductoPorCodigoSku(codigoSku: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stockTotalPorCodigoSkuProducto/${codigoSku}`);
  }

  listar(): Observable<Inventario[]> {
    return this.http.get<Inventario[]>(`${this.apiUrl}/buscarTodos`);
  }

  buscarPorCodigoSku(codigoSku: string): Observable<Inventario[]> {
    return this.http.get<Inventario[]>(`${this.apiUrl}/buscarPorCodigoSkuProducto?codigoSku=${codigoSku}`);
  }

  buscarPorId(id: number): Observable<Inventario>{
    return this.http.get<Inventario>(`${this.apiUrl}/buscarPorId?id=${id}`);
  }

  crear(inventario: Inventario): Observable<Inventario> {
    return this.http.post<Inventario>(`${this.apiUrl}/crear`, inventario);
  }

  actualizar(id: number, inventario: Inventario): Observable<Inventario> {
    return this.http.put<Inventario>(`${this.apiUrl}/actualizar/${id}`, inventario);
  }

  eliminar(idInventario: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eliminarInventario?id=${idInventario}`, {
      responseType: 'text' as 'json'
    });
  }
}
