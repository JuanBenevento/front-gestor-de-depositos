import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, FormsModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
  role = '';
  menuOpen = false;
  dropdownsOpen: { [key: string]: boolean } = {}; 

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
    this.menuOpen = false; 
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  toggleDropdown(event: Event): void {
    event.preventDefault();
    const target = (event.target as HTMLElement).innerText;
    this.dropdownsOpen[target] = !this.dropdownsOpen[target];
  }
}
