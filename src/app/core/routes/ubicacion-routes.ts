import { Routes } from '@angular/router';
import { UbicacionListComponent } from '../../features/gestion-ubicaciones/ubicacion-list/ubicacion-list.component';
import { UbicacionFormComponent } from '../../features/gestion-ubicaciones/ubicacion-form/ubicacion-form.component';
import { RoleGuard } from '../guards/role.guard';

export const ubicacionRoutes: Routes = [
  { path: 'ubicaciones', component: UbicacionListComponent, canActivate: [RoleGuard('ADMIN')] },
  { path: 'ubicaciones/nuevo', component: UbicacionFormComponent, canActivate: [RoleGuard('ADMIN')] },
  { path: 'ubicaciones/editar/:id', component: UbicacionFormComponent, canActivate: [RoleGuard('ADMIN')] }
];

