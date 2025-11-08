import { Routes } from '@angular/router';
import { RoleGuard } from '../guards/role.guard';
import { ProductoListComponent } from '../../features/gestion-productos/producto-list/producto-list.component';
import { ProductoFormComponent } from '../../features/gestion-productos/producto-form/producto-form.component';

export const productoRoutes: Routes = [
  { path: 'productos', component: ProductoListComponent, canActivate: [RoleGuard('ADMIN')] },
  { path: 'productos/nuevo', component: ProductoFormComponent, canActivate: [RoleGuard('ADMIN')] },
  { path: 'productos/editar/:id', component: ProductoFormComponent, canActivate: [RoleGuard('ADMIN')] }
];
