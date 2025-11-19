import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { DashboardHomeComponent } from './features/dashboard/dashboard-home/dashboard-home.component';
import { AuthGuard } from './core/guards/auth.guard';
import { usuarioRoutes } from './core/routes/usuario-routes';
import { zonaRoutes } from './core/routes/zona-routes';
import { ubicacionRoutes } from './core/routes/ubicacion-routes';
import { proveedorRoutes } from './core/routes/proveedor-routes';
import { clienteRoutes } from './core/routes/cliente-routes';
import { productoRoutes } from './core/routes/producto-routes';
import { OrdenDespachoRoutes } from './core/routes/ordenDespacho-routes';
import { OrdenRecepcionRoutes } from './core/routes/ordenRecepcion-routes';
import { InventarioRoutes } from './core/routes/inventario-routes';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },

  { 
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'OPERATIVO'] },
    children: [
      { path: '', component: DashboardHomeComponent },
      ...usuarioRoutes,
      ...zonaRoutes,
      ...ubicacionRoutes,
      ...proveedorRoutes,
      ...clienteRoutes,
      ...productoRoutes,
      ...OrdenDespachoRoutes,
      ...OrdenRecepcionRoutes,
      ...InventarioRoutes
    ]
  },

  { path: '**', redirectTo: 'login' }
];
