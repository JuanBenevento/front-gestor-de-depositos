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

    if (this.authService.isTokenExpired()) {
      console.warn("Token expirado detectado por AuthGuard.");
      this.authService.logout();
      this.router.navigate(['/login'], {
        queryParams: { expired: true }
      });
      return false;
    }

    const allowedRoles: string[] = route.data['roles'];

    if (allowedRoles && allowedRoles.length > 0) {
      const hasRole = allowedRoles.some(role =>
        this.authService.hasRole(role.toUpperCase())
      );

      if (!hasRole) {
        console.warn("Acceso denegado por rol insuficiente.");
        this.router.navigate(['/dashboard'], {
          queryParams: { forbidden: true }
        });
        return false;
      }
    }

    return true;
  }
}
