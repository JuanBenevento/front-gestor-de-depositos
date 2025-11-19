import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
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
import { DepositoLayoutRoutes } from './core/routes/deposito-layout.routes';
import { MovimientosInventarioRoutes } from './core/routes/movimiento-inventario.router';

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
      ...clienteRoutes,
      ...productoRoutes,
      ...OrdenDespachoRoutes,
      ...OrdenRecepcionRoutes,
      ...InventarioRoutes,
      ...MovimientosInventarioRoutes,
      ...DepositoLayoutRoutes
    ]
  },

  { path: '**', redirectTo: 'login' }
];
