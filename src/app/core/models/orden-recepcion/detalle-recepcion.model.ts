import { Producto } from "../Producto/producto.model";

export interface DetalleRecepcion {
  idDetalleRecepcion?: number;
  idOrdenRecepcion?: number;
  producto: Producto;      
  cantidad: number;
}

export interface DetalleRecepcionDTO {
  idOrdenRecepcion?: number;
  detalles: DetalleRecepcion[];
}
