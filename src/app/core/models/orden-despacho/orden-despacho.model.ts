import { EstadoDeOrden } from "../../enums/estados-de-orden.model";
import { Cliente } from "../cliente/cliente.model";
import { DetalleDespacho } from "./detalle-despacho.model";

export default interface OrdenDespacho {
  id_orden?: number;
  fecha: string;
  estado: EstadoDeOrden;
  cliente: Cliente;
  detalles: DetalleDespacho[];
}