import { Zona } from "../zona/zona.model";

export interface Ubicacion {
  idUbicacion?: number;
  codigo: string;
  zona: Zona;
  capacidadMaxima: number;
  ocupadoActual: number;
}
