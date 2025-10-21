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
      if (error.status === 401 || error.status === 403) {
        console.warn('Token invalido o acceso denegado');
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};