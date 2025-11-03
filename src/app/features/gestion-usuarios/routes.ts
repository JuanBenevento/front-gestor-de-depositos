import { Routes } from '@angular/router';
import { UsuarioListComponent } from './usuario-list/usuario-list.component';
import { UsuarioFormComponent } from './usuario-form/usuario-form.component';
import { RoleGuard } from '../../core/guards/role.guard';

export const usuarioRoutes: Routes = [
  { path: 'usuarios', component: UsuarioListComponent, canActivate: [RoleGuard('ADMIN')] },
  { path: 'usuarios/nuevo', component: UsuarioFormComponent, canActivate: [RoleGuard('ADMIN')] },
  { path: 'usuarios/editar/:id', component: UsuarioFormComponent, canActivate: [RoleGuard('ADMIN')] }
];

