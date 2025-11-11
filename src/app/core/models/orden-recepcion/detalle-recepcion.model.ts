import { Producto } from "../Producto/producto.model";

export interface DetalleRecepcion {
  idDetalleRecepcion?: number;
  producto: Producto;      
  cantidad: number;
}
