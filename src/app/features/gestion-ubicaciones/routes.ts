import { Routes } from '@angular/router';
import { UbicacionListComponent } from './ubicacion-list/ubicacion-list.component';
import { UbicacionFormComponent } from './ubicacion-form/ubicacion-form.component';
import { RoleGuard } from '../../core/guards/role.guard';

export const ubicacionRoutes: Routes = [
  { path: 'ubicaciones', component: UbicacionListComponent, canActivate: [RoleGuard('ADMIN')] },
  { path: 'ubicaciones/nuevo', component: UbicacionFormComponent, canActivate: [RoleGuard('ADMIN')] },
  { path: 'ubicaciones/editar/:id', component: UbicacionFormComponent, canActivate: [RoleGuard('ADMIN')] }
];

