import { Producto } from "../Producto/producto.model";

export interface MovimientoInventario {
  idMovimientoInventario?: number;
  producto: Producto;
  cantidad: number;
  fecha: Date;
  estado: string;
  ubicacionOrigen: {
    idUbicacion?: number;
  };
  ubicacionDestino: {
    idUbicacion?: number;
  };
}
