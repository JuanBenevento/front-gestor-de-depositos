import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // Si no está autenticado, redirige a login
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }

    // Roles permitidos en la ruta
    const allowedRoles: string[] = route.data['roles'];
    if (allowedRoles && allowedRoles.length > 0) {
      const hasRole = allowedRoles.some(role => this.authService.hasRole(role));
      if (!hasRole) {
        // Redirige a dashboard si no tiene permisos
        this.router.navigate(['/dashboard']);
        return false;
      }
    }

    return true;
  }
}
