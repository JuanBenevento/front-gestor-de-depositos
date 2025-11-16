import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

}