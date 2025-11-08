import { Routes } from '@angular/router';
import { ProveedoresListComponent } from './proveedores-list/proveedores-list.component';
import { ProveedoresFormComponent } from './proveedores-form/proveedores-form.component';
import { RoleGuard } from '../../core/guards/role.guard';

export const proveedorRoutes: Routes = [
  { path: 'proveedores', component: ProveedoresListComponent, canActivate: [RoleGuard('ADMIN')] },
  { path: 'proveedores/nuevo', component: ProveedoresFormComponent, canActivate: [RoleGuard('ADMIN')] },
  { path: 'proveedores/editar/:id', component: ProveedoresFormComponent, canActivate: [RoleGuard('ADMIN')] }
];

