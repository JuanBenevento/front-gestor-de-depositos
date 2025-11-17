import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" *ngIf="isOpen" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
    <div class="modal-header">
      <div>
        <h3>{{ title }}</h3>
      </div>
      <div>
        <button class="close-btn" type="button" (click)="closeModal()">&times;</button>
      </div>
    </div>
        <div class="modal-body">
          <ng-container *ngIf="contentTemplate; else defaultContent">
            <ng-container *ngTemplateOutlet="contentTemplate"></ng-container>
          </ng-container>
          <ng-template #defaultContent>
            <ng-content></ng-content>
            <p *ngIf="message">{{ message }}</p>
          </ng-template>
        </div>
        <div class="modal-footer" *ngIf="showFooter">
          <button
            *ngIf="showCancelButton"
            type="button"
            class="btn btn-secondary"
            (click)="closeModal()"
          >
            {{ cancelText }}
          </button>
          <button type="button" class="btn btn-primary" (click)="confirmAction()" [disabled]="!canConfirm">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() showFooter = true;
  @Input() showCancelButton = true;
  @Input() confirmText = 'Confirmar';
  @Input() cancelText = 'Cancelar';
  @Input() canConfirm = true;
  @Input() contentTemplate?: TemplateRef<unknown>;
  @Input() message = '';
  
  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();

  closeModal() {
    this.isOpen = false;
    this.closed.emit();
  }

  confirmAction() {
    this.confirmed.emit();
  }
}