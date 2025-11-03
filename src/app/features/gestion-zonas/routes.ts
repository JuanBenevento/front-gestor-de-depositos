import { Routes } from '@angular/router';
import { ZonaListComponent } from './zona-list/zona-list.component';
import { ZonaFormComponent } from './zona-form/zona-form.component';
import { RoleGuard } from '../../core/guards/role.guard';

export const zonaRoutes: Routes = [
  { path: 'zonas', component: ZonaListComponent, canActivate: [RoleGuard('ADMIN')] },
  { path: 'zonas/nuevo', component: ZonaFormComponent, canActivate: [RoleGuard('ADMIN')] },
  { path: 'zonas/editar/:id', component: ZonaFormComponent, canActivate: [RoleGuard('ADMIN')] }
];

