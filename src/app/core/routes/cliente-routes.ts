import { Routes } from '@angular/router';
import { ClienteListComponent } from '../../features/gestion-clientes/cliente-list/cliente-list.component';
import { ClienteFormComponent } from '../../features/gestion-clientes/cliente-form/cliente-form.component';
import { RoleGuard } from '../guards/role.guard';

export const clienteRoutes: Routes = [
  { path: 'clientes', component: ClienteListComponent, canActivate: [RoleGuard('ADMIN')] },
  { path: 'clientes/nuevo', component: ClienteFormComponent, canActivate: [RoleGuard('ADMIN')] },
  { path: 'clientes/editar/:id', component: ClienteFormComponent, canActivate: [RoleGuard('ADMIN')] }
];

