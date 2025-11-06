import { Routes } from '@angular/router';
import { ClienteListComponent } from './cliente-list/cliente-list.component';
import { ClienteFormComponent } from './cliente-form/cliente-form.component';
import { RoleGuard } from '../../core/guards/role.guard';

export const clienteRoutes: Routes = [
  { path: 'clientes', component: ClienteListComponent, canActivate: [RoleGuard('ADMIN')] },
  { path: 'clientes/nuevo', component: ClienteFormComponent, canActivate: [RoleGuard('ADMIN')] },
  { path: 'clientes/editar/:id', component: ClienteFormComponent, canActivate: [RoleGuard('ADMIN')] }
];

