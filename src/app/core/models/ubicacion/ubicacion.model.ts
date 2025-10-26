export interface Ubicacion {
  idUbicacion?: number;
  codigo: string;
  zona: {
    idZona?: number;
    nombre?: string;
    descripcion?: string;
  } | null;
  capacidadMaxima: number;
  ocupadoActual: number;
}
