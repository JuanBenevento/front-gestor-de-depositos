import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const RoleGuard = (requiredRoles: string | string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/login']);
      return false;
    }

    if (authService.isTokenExpired()) {
      console.warn("Token expirado detectado por RoleGuard.");
      authService.logout();
      router.navigate(['/login'], { queryParams: { expired: true } });
      return false;
    }

    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

    const hasRole = roles.some(role => authService.hasRole(role.toUpperCase()));

    if (hasRole) {
      return true;
    }

    console.warn("Rol insuficiente.");
    router.navigate(['/dashboard'], { queryParams: { forbidden: true } });
    return false;
  };
};
