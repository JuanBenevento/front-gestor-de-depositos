import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, HeaderComponent, SidebarComponent, FooterComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {

  role = '';
  userName = 'Usuario WMS'; 
  currentDate = '';
  currentTime = '';
  isSidebarOpen: boolean = false; 

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.role = this.authService.getRole() || '';
   
    const today = new Date();
    this.currentDate = today.toLocaleDateString('es-AR', {
      weekday: "long",
      day: "numeric",
      month: "long"
    });

    setInterval(() => {
      const now = new Date();
      this.currentTime = now.toLocaleTimeString('es-AR');
    }, 1000);
  }

  isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  isOperativo(): boolean {
    return this.authService.hasRole('OPERATIVO');
  }

  navigate(path: string): void {
    this.router.navigate([path]);
    if (this.isSidebarOpen) {
      this.isSidebarOpen = false;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebarOnOverlayClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (this.isSidebarOpen && target.classList.contains('main-area')) {
        this.isSidebarOpen = false;
    }
  }
}