import { Injectable, TemplateRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ModalPayload {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  showFooter?: boolean;
  showCancelButton?: boolean;
  canConfirm?: boolean;
  template?: TemplateRef<unknown>;
  context?: Record<string, unknown>;
  onConfirm?: () => void;
  onClose?: () => void;
}

export interface ModalState extends ModalPayload {
  isOpen: boolean;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  private readonly initialState: ModalState = {
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Aceptar',
    cancelText: 'Cancelar',
    showFooter: true,
    showCancelButton: false,
    canConfirm: true
  };

  private readonly modalStateSubject = new BehaviorSubject<ModalState>(this.initialState);
  readonly modalState$ = this.modalStateSubject.asObservable();

  open(payload: ModalPayload): void {
    const state: ModalState = {
      ...this.initialState,
      ...payload,
      confirmText: payload.confirmText ?? this.initialState.confirmText,
      cancelText: payload.cancelText ?? this.initialState.cancelText,
      showFooter: payload.showFooter ?? this.initialState.showFooter,
      showCancelButton: payload.showCancelButton ?? this.initialState.showCancelButton,
      canConfirm: payload.canConfirm ?? this.initialState.canConfirm,
      isOpen: true
    };

    this.modalStateSubject.next(state);
  }

  close(): void {
    const current = this.modalStateSubject.getValue();
    current.onClose?.();
    this.modalStateSubject.next(this.initialState);
  }

  confirm(): void {
    const current = this.modalStateSubject.getValue();
    current.onConfirm?.();
    this.modalStateSubject.next(this.initialState);
  }
}
