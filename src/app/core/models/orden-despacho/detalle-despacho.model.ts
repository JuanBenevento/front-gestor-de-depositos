import { Producto } from "../Producto/producto.model";

export interface DetalleDespacho {
  id_detalle?: number;
  producto: Producto;      
  cantidad: number;
  ordenDespacho?: number;
}
