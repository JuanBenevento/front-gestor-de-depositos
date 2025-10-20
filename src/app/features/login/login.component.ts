import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../core/models/auth/login-request.model';
import { LoginResponse } from '../../core/models/auth/login-response.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credentials: LoginRequest = { nombre: '', contrasenia: '' };
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
  this.errorMessage = '';

  this.authService.login(this.credentials).subscribe({
    next: (response: LoginResponse) => {
      // Login exitoso
      const rol = this.authService.getRole() || '';
      if (rol === 'ADMIN' || rol === 'OPERATIVO') {
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage = 'Rol desconocido';
      }
    },
    error: (err) => {
      console.error('Error de login:', err);

      // Solo mostramos un mensaje genérico si es login fallido
      if (err.status === 401) {
        this.errorMessage = 'Usuario o contraseña incorrectos';
      } else {
        this.errorMessage = 'Error del servidor. Intente nuevamente';
      }
    }
  });
}

}
