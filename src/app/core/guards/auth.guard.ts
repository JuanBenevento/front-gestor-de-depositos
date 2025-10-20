import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }

    // Roles permitidos en la ruta
    const allowedRoles: string[] = route.data['roles'];
    if (allowedRoles && allowedRoles.length > 0) {
      const hasRole = allowedRoles.some(role => 
        this.authService.hasRole(role.toUpperCase())
      );
      if (!hasRole) {
        this.router.navigate(['/dashboard']);
        return false;
      }
    }

    return true;
  }
}
