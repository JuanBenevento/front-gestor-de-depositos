import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'] 
})
export class SidebarComponent {

  @Input() isAdmin: boolean = false;
  @Input() isOperativo: boolean = false;
  @Input() isSidebarOpen: boolean = false; 

  @Output() navigateRequest = new EventEmitter<string>();
  @Output() closeSidebar = new EventEmitter<void>();

  dropdownsOpen: { [key: string]: boolean } = {
    ordenes: false
  };

  navigateTo(path: string): void {
    this.navigateRequest.emit(path);
  }

  toggleDropdown(key: string): void {
    this.dropdownsOpen[key] = !this.dropdownsOpen[key];
  }
}