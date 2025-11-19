export enum MovimientoInventarioEstado {
  ENTRADA = 'ENTRADA',
  SALIDA = 'SALIDA',
  REUBICACION = 'REUBICACION'
}

export const MOVIMIENTO_INVENTARIO_ESTADOS: MovimientoInventarioEstado[] = [
  MovimientoInventarioEstado.ENTRADA,
  MovimientoInventarioEstado.SALIDA,
  MovimientoInventarioEstado.REUBICACION
];
