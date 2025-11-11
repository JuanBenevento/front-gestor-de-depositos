import { Routes } from '@angular/router';
import { RoleGuard } from '../guards/role.guard';
import { OrdenRecepcionListComponent } from '../../features/gestion-ordenes-recepcion/orden-recepcion-list/orden-recepcion-list.component';
import { OrdenRecepcionFormComponent } from '../../features/gestion-ordenes-recepcion/orden-recepcion-form/orden-recepcion-form.component';

export const OrdenRecepcionRoutes: Routes = [
  { path: 'ordenesRecepcion', component: OrdenRecepcionListComponent, canActivate: [RoleGuard('ADMIN')] },
  { path: 'ordenesRecepcion/nuevo', component: OrdenRecepcionFormComponent, canActivate: [RoleGuard('ADMIN')] },
  { path: 'ordenesRecepcion/editar/:id', component: OrdenRecepcionFormComponent, canActivate: [RoleGuard('ADMIN')] }
];

