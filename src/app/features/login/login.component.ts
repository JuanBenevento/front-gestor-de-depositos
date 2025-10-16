import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common'; 
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../core/models/auth.model';

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
  this.authService.login(this.credentials).subscribe({
    next: (response) => {
      console.log('✅ Login exitoso:', response);
      
      // Guarda los datos (por si el tap del AuthService no se ejecuta por error)
      localStorage.setItem('token', response.token);
      localStorage.setItem('role', response.rol);

      // Redirige según el rol
      if (response.rol === 'ROLE_ADMIN') {
        this.router.navigate(['/dashboard']); // o '/dashboard/admin' si luego separás vistas
      } else if (response.rol === 'ROLE_OPERATIVO') {
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage = 'Rol desconocido';
      }
    },
    error: (err) => {
      console.error('❌ Error de login:', err);
      this.errorMessage = 'Credenciales incorrectas';
    }
  });
}

}
