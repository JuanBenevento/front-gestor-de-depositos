import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZonesMapComponent } from '../zones-map/zones-map.component';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, ZonesMapComponent],
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.css'
})
export class DashboardHomeComponent {}
