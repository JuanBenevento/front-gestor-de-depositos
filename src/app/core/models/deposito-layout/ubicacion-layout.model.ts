export interface UbicacionLayout {
  idUbicacion: number;
  codigo: string;
  capacidadMaxima: number;
  ocupadoActual: number;

  x: number;
  y: number;
  w: number; 
  h: number; 
  productos?: any[];
}
