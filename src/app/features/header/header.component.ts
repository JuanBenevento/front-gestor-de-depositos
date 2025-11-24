import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  @Input() currentDate: string = '';
  @Input() currentTime: string = '';
  @Input() userName: string = '';
  @Input() role: string = '';

  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() logoutRequest = new EventEmitter<void>();
}
