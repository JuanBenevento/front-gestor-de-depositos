import { Routes } from "@angular/router";
import { DepositoLayoutComponent } from "../../features/deposito-layout/deposito-layout.component";
import { RoleGuard } from "../guards/role.guard";

export const DepositoLayoutRoutes: Routes = [
  {
    path: 'depositoLayout',
    component: DepositoLayoutComponent,
    canActivate: [RoleGuard('Admin')]
  }
];