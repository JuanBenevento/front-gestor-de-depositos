import { EstadoDeOrden } from "../../enums/estados-de-orden.model";
import { Cliente } from "../cliente/cliente.model";
import { DetalleDespacho } from "./detalle-despacho.model";

export default interface OrdenDespacho {
  idOrdenDespacho?: number;
  fechaDespacho: string;
  estado: EstadoDeOrden;
  cliente: Cliente;
  detalle_despacho: DetalleDespacho[];
}