import { Producto } from "../Producto/producto.model";
import { Ubicacion } from "../ubicacion/ubicacion.model";

export interface MovimientoInventario {
  idMovimientoInventario?: number;
  producto: Producto;
  cantidad: number;
  fecha: Date;
  estado: string;
  ubicacionOrigen: Ubicacion;
  ubicacionDestino: Ubicacion;
}
