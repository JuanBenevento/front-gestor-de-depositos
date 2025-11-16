import { Producto } from "../Producto/producto.model";

export interface MovimientoInventario {
  id_movimiento?: number;
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
