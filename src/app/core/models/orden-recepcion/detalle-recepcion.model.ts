import { Producto } from "../Producto/producto.model";

export interface DetalleRecepcion {
  idDetalleRecepcion?: number;
  idOrdenRecepcion?: number;
  producto: Producto;      
  cantidad: number;
}

export interface DetalleRecepcionDTO {
  idDetalleRecepcion?: number;
  producto: any;           
  cantidad: number;
  idOrdenRecepcion?: number;
  codigoSku: string;
}
