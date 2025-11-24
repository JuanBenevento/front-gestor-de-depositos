import { CategoriasProducto } from "../../enums/categoriasProductos.model";
import { UbicacionLayout } from "./ubicacion-layout.model";

export interface ZonaLayout {
  idZona: number;
  nombre: string;
  descripcion?: string;
  ubicaciones: UbicacionLayout[];
  color?: string; 
  categoriasAdmitidas?: CategoriasProducto[]; 
}
