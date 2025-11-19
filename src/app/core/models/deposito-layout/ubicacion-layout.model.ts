import { ProductoStock } from "./producto-stock.model";

export interface UbicacionLayout {
  idUbicacion: number;
  codigo: string;

  capacidadMaxima: number;
  ocupadoActual: number;

  productos: ProductoStock[];

  x: number;
  y: number;

  // NUEVO (para layout visual)
  w: number;
  h: number;
}
