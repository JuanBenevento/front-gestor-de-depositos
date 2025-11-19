import { UbicacionLayout } from "./ubicacion-layout.model";

export interface ZonaLayout {
  idZona: number;
  nombre: string;
  descripcion?: string;
  color?: string;

  ubicaciones: UbicacionLayout[];
}
