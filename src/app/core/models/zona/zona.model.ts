import { CategoriasProducto } from "../../enums/categoriasProductos.model";

export interface Zona {
  idZona?: number;     
  nombre: string;
  descripcion: string; 
  categoriasAdmitidas: CategoriasProducto[];         
}
