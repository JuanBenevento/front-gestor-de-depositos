import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from './modal.component';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-modal-host',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  template: `
    <ng-container *ngIf="modalState$ | async as state">
      <app-modal
        [isOpen]="state.isOpen"
        [title]="state.title || ''"
        [showFooter]="state.showFooter ?? true"
        [showCancelButton]="state.showCancelButton ?? false"
        [confirmText]="state.confirmText || 'Aceptar'"
        [cancelText]="state.cancelText || 'Cancelar'"
        [canConfirm]="state.canConfirm ?? true"
        [contentTemplate]="state.template"
        [message]="state.message || ''"
        (closed)="handleClose()"
        (confirmed)="handleConfirm()"
      ></app-modal>
    </ng-container>
  `
})
export class ModalHostComponent {
  private readonly modalService = inject(ModalService);
  readonly modalState$ = this.modalService.modalState$;

  handleClose(): void {
    this.modalService.close();
  }

  handleConfirm(): void {
    this.modalService.confirm();
  }
}
