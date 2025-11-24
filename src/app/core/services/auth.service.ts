import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest } from '../models/auth/login-request.model';
import { LoginResponse } from '../models/auth/login-response.model';
import { UsuarioService } from './usuario.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:8080/GestorDeDepositos';

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap(response => {
        const rol = response.rol?.replace('ROLE_', '').toUpperCase() || '';
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', rol);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  hasRole(requiredRoles: string | string[]): boolean {
    const role = this.getRole();
    if (!role) return false;

    return Array.isArray(requiredRoles)
      ? requiredRoles.includes(role)
      : role === requiredRoles;
  }

  isTokenExpired(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return true;

    const payload = JSON.parse(atob(token.split('.')[1]));

    const exp = payload.exp;
    const now = Math.floor(Date.now() / 1000);

    return exp < now;
  }
}
