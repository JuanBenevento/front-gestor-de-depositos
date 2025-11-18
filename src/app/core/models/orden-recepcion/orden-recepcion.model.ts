import { EstadoDeOrden } from "../../enums/estados-de-orden.model";
import { DetalleRecepcion, DetalleRecepcionDTO } from "./detalle-recepcion.model";

export default interface OrdenRecepcion {
  id_orden_recepcion?: number;
  idProveedor?: number;
  fecha: string;
  estado: EstadoDeOrden;
  detalleRecepcionDTOList: DetalleRecepcionDTO[];
}