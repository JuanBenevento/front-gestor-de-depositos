import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface InfoCardItem {
  label: string;
  value: string | number | null | undefined;
}

@Component({
  selector: 'app-info-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './info-card.component.html',
  styleUrl: './info-card.component.css'
})
export class InfoCardComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) items: InfoCardItem[] = [];
}
