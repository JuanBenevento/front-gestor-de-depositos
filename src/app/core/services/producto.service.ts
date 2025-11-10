import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Producto } from "../models/producto/producto.model";
import { BASE_URL } from "../../constants/baseUrl";

@Injectable({providedIn: "root"})
export class ProductoService {
    private baseUrl = `${BASE_URL}/producto`;

    constructor(private http: HttpClient){}

    listar(): Observable<Producto[]> {
        return this.http.get<Producto[]>(`${this.baseUrl}/todos`);
    }

    crear(producto: Producto): Observable<Producto> {
        return this.http.post<Producto>(`${this.baseUrl}/crearProducto`, producto);
    }

    actualizar(producto: Producto): Observable<Producto> {
        return this.http.put<Producto>(`${this.baseUrl}/actualizarProducto`, producto);
    }
    
    eliminar(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/eliminarProducto?id=${id}`);
    }

    buscarPorId(id: number): Observable<Producto> {
        return this.http.get<Producto>(`${this.baseUrl}/buscar?id=${id}`);
    }
    
    buscarPorNombre(nombre: string): Observable<Producto[]> {
        return this.http.get<Producto[]>(`${this.baseUrl}/buscarPorNombre?nombre=${nombre}`);
    }
    
    buscarPorCodigoSku(codigoSku: string): Observable<Producto[]> {
        return this.http.get<Producto[]>(`${this.baseUrl}/buscarPorCodigoSku?codigoSku=${codigoSku}`);
    }
    
    buscarPorUnidadMedida(unidadMedida: string): Observable<Producto[]> {
        return this.http.get<Producto[]>(`${this.baseUrl}/buscarPorUnidadMedida?unidadMedida=${unidadMedida}`);
    }
}