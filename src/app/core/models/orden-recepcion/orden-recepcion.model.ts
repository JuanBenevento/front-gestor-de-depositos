import { EstadoDeOrden } from "../../enums/estados-de-orden.model";
import { DetalleRecepcion } from "./detalle-recepcion.model";

export default interface OrdenRecepcion {
  id_orden_recepcion?: number;
  idProveedor?: number;
  fecha: string;
  estado: EstadoDeOrden;
  detalleRecepcionDTOList: DetalleRecepcion[];
}