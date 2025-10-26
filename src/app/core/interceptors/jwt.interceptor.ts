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
          'Content-Type': 'application/json'
        }
      })
    : req;

  console.log('Interceptor activo -> URL:', authReq.url);

  return next(authReq).pipe(
    catchError(error => {
      // Solo hacer logout/redirección si el backend devuelve un error real 401 o 403
      if (error.status === 401) {
        console.warn('Token inválido o sesión expirada');
        authService.logout();
        router.navigate(['/login']);
      } else if (error.status === 403) {
        console.warn('Acceso denegado');
        router.navigate(['/dashboard']);
      }
      // Re-lanzamos el error para que el componente lo pueda manejar si quiere
      return throwError(() => error);
    })
  );
};