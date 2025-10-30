import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Proveedor } from "../models/proveedor/proveedor.model";

@Injectable({providedIn: "root"})
export class ProveedoresService {
    private baseUrl = 'http://localhost:8080/GestorDeDepositos/proveedor';

    constructor(private http: HttpClient){}

    listar(): Observable<Proveedor[]> {
        return this.http.get<Proveedor[]>(`${this.baseUrl}/todosTodos`);
    }

    crear(provider: Proveedor): Observable<Proveedor>{
        return this.http.post<Proveedor>(`${this.baseUrl}/crearProveedor`, provider);
    }

    actualizar(provider: Proveedor):  Observable<Proveedor>{
        return this.http.put<Proveedor>(`${this.baseUrl}/actualizarProveedor/${provider.id_proveedor}`, provider);
    }

    buscarPorId(id: number): Observable<Proveedor> { 
        return this.http.get<Proveedor>(`${this.baseUrl}/buscarPorId?id=${id}`);
    }

    eliminar(id: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/eliminarProveedor?id=${id}`, {responseType: 'text'});
    }
}