import { EstadoDeOrden } from "../../enums/estados-de-orden.model";
import { Proveedor } from "../proveedor/proveedor.model";
import { DetalleRecepcionDTO } from "./detalle-recepcion.model";

export default interface OrdenRecepcion {
  id_orden_recepcion?: number;
  proveedor?: Proveedor;
  fecha: string;
  estado: EstadoDeOrden;
  detalleRecepcionDTOList: DetalleRecepcionDTO[];
}