import { Routes } from '@angular/router';
import { OrdenDespachoListComponent } from '../../features/gestion-ordenes-despacho/orden-despacho-list/gestion-ordenes-despacho-list.component';
import { OrdenesDespachoForm } from '../../features/gestion-ordenes-despacho/orden-despacho-form/gestion-ordenes-despacho-form.component'; 
import { RoleGuard } from '../guards/role.guard';

export const OrdenDespachoRoutes: Routes = [
  { path: 'ordenesDespacho', component: OrdenDespachoListComponent, canActivate: [RoleGuard(['ADMIN', 'OPERATIVO'])] },
  { path: 'ordenesDespacho/nuevo', component: OrdenesDespachoForm, canActivate: [RoleGuard(['ADMIN', 'OPERATIVO'])] },
  { path: 'ordenesDespacho/editar/:id', component: OrdenesDespachoForm, canActivate: [RoleGuard(['ADMIN', 'OPERATIVO'])] }
];

