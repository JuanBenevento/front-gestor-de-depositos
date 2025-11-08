import { Routes } from '@angular/router';
import { UsuarioListComponent } from '../../features/gestion-usuarios/usuario-list/usuario-list.component';
import { UsuarioFormComponent } from '../../features/gestion-usuarios/usuario-form/usuario-form.component';
import { RoleGuard } from '../guards/role.guard';

export const usuarioRoutes: Routes = [
  { path: 'usuarios', component: UsuarioListComponent, canActivate: [RoleGuard('ADMIN')] },
  { path: 'usuarios/nuevo', component: UsuarioFormComponent, canActivate: [RoleGuard('ADMIN')] },
  { path: 'usuarios/editar/:id', component: UsuarioFormComponent, canActivate: [RoleGuard('ADMIN')] }
];

