import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const RoleGuard = (requiredRole: string): CanActivateFn => {
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

    if (authService.hasRole(requiredRole.toUpperCase())) {
      return true;
    }

    console.warn("Rol insuficiente.");
    router.navigate(['/dashboard'], { queryParams: { forbidden: true } });
    return false;
  };
};
