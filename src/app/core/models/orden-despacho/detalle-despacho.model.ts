import { Producto } from "../Producto/producto.model";

export interface DetalleDespacho {
  idDetalleDespacho?: number;
  producto: Producto;      
  cantidad: number;
  ordenDespacho?: number;
}
