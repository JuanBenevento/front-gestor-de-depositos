import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { UsuariosListComponent } from './features/gestion-usuarios/usuario-list/usuario-list.component';
import { UsuarioFormComponent } from './features/gestion-usuarios/usuario-form/usuario-form.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { ZonaListComponent } from './features/gestion-zonas/zona-list/zona-list.component';
import { ZonaFormComponent } from './features/gestion-zonas/zona-form/zona-form.component';
import { UbicacionListComponent } from './features/gestion-ubicaciones/ubicacion-list/ubicacion-list.component';
import { UbicacionFormComponent } from './features/gestion-ubicaciones/ubicacion-form/ubicacion-form.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },

  { 
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'OPERATIVO'] },
    children: [
      { path: 'usuarios', component: UsuarioListComponent, canActivate: [RoleGuard('ADMIN')] },
      { path: 'usuarios/nuevo', component: UsuarioFormComponent, canActivate: [RoleGuard('ADMIN')] },
      { path: 'usuarios/editar/:id', component: UsuarioFormComponent, canActivate: [RoleGuard('ADMIN')] },
      { path: 'zonas', component: ZonaListComponent, canActivate: [RoleGuard('ADMIN')] },
      { path: 'zonas/nuevo', component: ZonaFormComponent, canActivate: [RoleGuard('ADMIN')] },
      { path: 'zonas/editar/:id', component: ZonaFormComponent, canActivate: [RoleGuard('ADMIN')] },
      { path: 'ubicaciones', component: UbicacionListComponent, canActivate: [RoleGuard('ADMIN')] },
      { path: 'ubicaciones/nuevo', component: UbicacionFormComponent, canActivate: [RoleGuard('ADMIN')] },
      { path: 'ubicaciones/editar/:id', component: UbicacionFormComponent, canActivate: [RoleGuard('ADMIN')] }
    ]
  },

  { path: '**', redirectTo: 'login' }
];
