import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

export interface ValidationMessage {
  errorKey: string;
  message: string;
}

@Component({
  selector: 'app-form-text-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-text-input.component.html',
  styleUrl: './form-text-input.component.css'
})
export class FormTextInputComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) control!: FormControl;
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() min?: string | number;
  @Input() max?: string | number;
  @Input() step?: string | number;
  @Input() required = false;
  @Input() showRequiredIndicator = true;
  @Input() inline = true;
  @Input() externalError = '';
  @Input() validationMessages: ValidationMessage[] = [];
  @Input() id?: string;
  @Input() autocomplete?: string;
  @Input() inputmode?: string;
  @Input() disabled = false;

  get controlInvalid(): boolean {
    return !!this.control && this.control.invalid && (this.control.touched || this.control.dirty);
  }

  get visibleMessages(): string[] {
    if (!this.controlInvalid) {
      return [];
    }

    return this.validationMessages
      .filter(msg => this.control?.hasError(msg.errorKey))
      .map(msg => msg.message);
  }

  get inputId(): string {
    return this.id || this.label?.toLowerCase().replace(/\s+/g, '-') || 'text-input';
  }
}
