import { CategoriasProducto } from "../../enums/categoriasProductos.model";

export interface Producto {
  idProducto?: number;          
  nombre: string;               
  descripcion: string;          
  codigoSku: string;            
  unidad_medida: string;        
  fecha_creacion: string; 
  categoria: CategoriasProducto;      
  isDeleted?: string;           
}
