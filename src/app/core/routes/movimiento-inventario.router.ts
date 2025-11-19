import { Routes } from '@angular/router';
import { RoleGuard } from '../guards/role.guard';
import { MovimientosList } from '../../features/gestion-movimientos-inventario/movimientos-list/movimientos-list';
import { MovimientosForm } from '../../features/gestion-movimientos-inventario/movimientos-form/movimientos-form';

export const MovimientosInventarioRoutes: Routes = [
  { path: 'movimientosInventario', component: MovimientosList, canActivate: [RoleGuard(['ADMIN', 'OPERATIVO'])] },
  { path: 'movimientosInventario/nuevo', component: MovimientosForm, canActivate: [RoleGuard(['ADMIN', 'OPERATIVO'])] },
  { path: 'movimientosInventario/editar/:id', component: MovimientosForm, canActivate: [RoleGuard(['ADMIN', 'OPERATIVO'])] }
];

