import { Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards/role.guard';
import { GestionProductosListComponent } from './producto-list/gestion-productos.component';

export const productoRoutes: Routes = [
  { path: 'producto', component: GestionProductosListComponent, canActivate: [RoleGuard('ADMIN')] },
//   { path: 'clientes/nuevo', component: ClienteFormComponent, canActivate: [RoleGuard('ADMIN')] },
//   { path: 'clientes/editar/:id', component: ClienteFormComponent, canActivate: [RoleGuard('ADMIN')] }
];