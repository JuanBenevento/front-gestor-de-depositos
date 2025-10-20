import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { UsuariosListComponent } from './features/gestion-usuarios/usuario-list/usuario-list.component';
import { UsuarioFormComponent } from './features/gestion-usuarios/usuario-form/usuario-form.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },

  // Dashboard accesible para ADMIN y OPERATIVO
  { 
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'OPERATIVO'] },
    children: [
      // Gestión de usuarios solo para ADMIN
      { path: 'usuarios', component: UsuariosListComponent, canActivate: [RoleGuard('ADMIN')] },
      { path: 'usuarios/nuevo', component: UsuarioFormComponent, canActivate: [RoleGuard('ADMIN')] },
      { path: 'usuarios/editar/:id', component: UsuarioFormComponent, canActivate: [RoleGuard('ADMIN')] }
    ]
  },

  { path: '**', redirectTo: 'login' }
];
