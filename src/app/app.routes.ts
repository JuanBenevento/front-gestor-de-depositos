import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AuthGuard } from './core/guards/auth.guard';
import { usuarioRoutes } from './features/gestion-usuarios/routes';
import { zonaRoutes } from './features/gestion-zonas/routes';
import { ubicacionRoutes } from './features/gestion-ubicaciones/routes';
import { proveedorRoutes } from './features/gestion-proveedores/routes';
import { clienteRoutes } from './features/gestion-clientes/routes';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },

  { 
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'OPERATIVO'] },
    children: [
      ...usuarioRoutes,
      ...zonaRoutes,
      ...ubicacionRoutes,
      ...proveedorRoutes,
      ...clienteRoutes
    ]
  },

  { path: '**', redirectTo: 'login' }
];
