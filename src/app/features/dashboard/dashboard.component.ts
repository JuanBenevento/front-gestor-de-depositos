import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  role = '';

  constructor(private authService: AuthService, private router: Router) {
    this.role = this.authService.getRole() || '';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  isOperativo(): boolean {
    return this.authService.hasRole('OPERATIVO');
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }
}
