export interface Inventario {
  id_inventario?: number;
  producto: {
    idProducto: number;
    nombre?: string;
    codigoSku?: string;
  };
  ubicacion: {
    idUbicacion: number;
    codigo?: string;
  };
  cantidad: number;
  fecha_actualizacion?: string;
}
