import { Routes } from "@angular/router";
import { InventarioListComponent } from "../../features/gestion-inventarios/inventario-list/inventario-list.component";
import { RoleGuard } from "../guards/role.guard";
import { InventarioFormComponent } from "../../features/gestion-inventarios/inventario-form/inventario-form.component";

export const InventarioRoutes: Routes = [
  {path: 'inventarios', component: InventarioListComponent, canActivate: [RoleGuard(['ADMIN', 'OPERATIVO'])]},
  {path: 'inventarios/nuevo', component: InventarioFormComponent, canActivate: [RoleGuard(['ADMIN', 'OPERATIVO'])]},
  {path: 'inventarios/editar/:id', component: InventarioFormComponent, canActivate: [RoleGuard(['ADMIN', 'OPERATIVO'])]},
];