import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = localStorage.getItem('token');

  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  return next(authReq).pipe(
    catchError(error => {
      const currentUrl = router.url;

      const backendMessage =
        error?.error?.message ||
        error?.error ||
        error?.message ||
        '';

      if (backendMessage.toString().toLowerCase().includes("expired")) {
        console.warn("Token expirado. Debes iniciar sesion nuevamente.");

        if (!currentUrl.includes('/login')) {
          authService.logout();
          router.navigate(['/login'], {
            queryParams: { expired: true }
          });
        }

        return throwError(() => error);
      }

      if (backendMessage.toString().toLowerCase().includes("invalid")) {
        console.warn("Token invalido.");

        if (!currentUrl.includes('/login')) {
          authService.logout();
          router.navigate(['/login'], {
            queryParams: { invalid: true }
          });
        }

        return throwError(() => error);
      }

      if (error.status === 403) {
        console.warn("Acceso denegado por permisos.");

        if (!currentUrl.includes('/dashboard')) {
          router.navigate(['/dashboard'], {
            queryParams: { forbidden: true }
          });
        }

        return throwError(() => error);
      }

      if (error.status === 401) {
        console.warn("No autorizado o token no valido.");

        if (!currentUrl.includes('/login')) {
          authService.logout();
          router.navigate(['/login']);
        }

        return throwError(() => error);
      }

      return throwError(() => error);
    })
  );
};