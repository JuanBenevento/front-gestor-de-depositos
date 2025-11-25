import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  forwardRef,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: "app-typeahead-select",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./typeahead-select.component.html",
  styleUrl: "./typeahead-select.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TypeaheadSelectComponent),
      multi: true,
    },
  ],
})
export class TypeaheadSelectComponent<T = unknown>
  implements ControlValueAccessor, OnChanges
{
  @Input() label = "";
  @Input() placeholder = "Escribí para buscar";
  @Input() helperText = "";
  @Input() errorText = "";
  @Input() loading = false;
  @Input() disabled = false;
  @Input() options: T[] = [];
  @Input() optionLabelKey?: keyof T | string;
  @Input() optionValueKey?: keyof T | string;
  @Input() displayWith?: (option: T) => string;
  @Input() minChars = 0;
  @Input() noResultsText = "No encontramos coincidencias";
  @Input() emptyQueryText = "Ingresá al menos {{minChars}} caracteres";

  @Output() search = new EventEmitter<string>();
  @Output() optionSelected = new EventEmitter<T | null>();

  searchTerm = "";
  filteredOptions: T[] = [];
  dropdownVisible = false;
  activeIndex = -1;
  private value: T | null = null;

  private onChange: (value: T | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private host: ElementRef<HTMLElement>) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["options"] && this.dropdownVisible && !this.requiresMoreChars) {
      this.applyFilter();
    }
  }

  writeValue(value: T | null): void {
    this.value = value;
    this.searchTerm = value ? this.getOptionLabel(value) : "";
  }

  registerOnChange(fn: (value: T | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(term: string): void {
    this.searchTerm = term;
    this.value = null;
    this.onChange(null);
    this.optionSelected.emit(null);

    if (!this.requiresMoreChars) {
      this.applyFilter();
      this.search.emit(term);
      this.dropdownVisible = true;
    } else {
      this.filteredOptions = [];
      this.dropdownVisible = true;
    }
    this.activeIndex = this.filteredOptions.length ? 0 : -1;
  }

  onFocus(): void {
    if (this.disabled) return;
    this.dropdownVisible = true;
    if (!this.requiresMoreChars) {
      this.applyFilter();
    } else {
      this.filteredOptions = [];
    }
  }

  onBlur(): void {
    this.onTouched();
  }

  selectOption(option: T): void {
    this.value = option;
    this.searchTerm = this.getOptionLabel(option);
    this.dropdownVisible = false;
    this.filteredOptions = [];
    this.activeIndex = -1;
    this.onChange(option);
    this.optionSelected.emit(option);
  }

  clearSelection(event?: Event): void {
    event?.stopPropagation();
    this.value = null;
    this.searchTerm = "";
    this.filteredOptions = [];
    this.dropdownVisible = false;
    this.activeIndex = -1;
    this.onChange(null);
    this.optionSelected.emit(null);
  }

  onKeydown(event: KeyboardEvent): void {
    if (!this.dropdownVisible) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        this.moveActiveIndex(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        this.moveActiveIndex(-1);
        break;
      case "Enter":
        if (this.activeIndex >= 0 && this.filteredOptions[this.activeIndex]) {
          event.preventDefault();
          this.selectOption(this.filteredOptions[this.activeIndex]);
        }
        break;
      case "Escape":
        this.dropdownVisible = false;
        break;
      default:
        break;
    }
  }

  trackByValue = (_: number, option: T) => {
    if (this.optionValueKey) {
      const value = (option as Record<string, unknown>)[
        this.optionValueKey as string
      ];
      return value ?? option;
    }
    return option;
  };

  getOptionLabel(option: T): string {
    if (!option) return "";
    if (this.displayWith) {
      return this.displayWith(option);
    }

    if (this.optionLabelKey) {
      const label = (option as Record<string, unknown>)[
        this.optionLabelKey as string
      ];
      if (label !== undefined && label !== null) {
        return String(label);
      }
    }

    return String(option);
  };

  isOptionSelected(option: T): boolean {
    if (!this.value) {
      return false;
    }

    if (this.optionValueKey) {
      const currentValue = (this.value as Record<string, unknown>)[
        this.optionValueKey as string
      ];
      const optionValue = (option as Record<string, unknown>)[
        this.optionValueKey as string
      ];
      return currentValue === optionValue;
    }

    return this.value === option;
  }

  get hasSelection(): boolean {
    return !!this.value;
  }

  get requiresMoreChars(): boolean {
    return (
      this.minChars > 0 && this.searchTerm.trim().length < this.minChars
    );
  }

  get minCharsMessage(): string {
    return this.emptyQueryText.replace("{{minChars}}", String(this.minChars));
  }

  private applyFilter(): void {
    const term = this.searchTerm.trim().toLowerCase();
    const labelGetter = (option: T) =>
      this.getOptionLabel(option).trim().toLowerCase();

    this.filteredOptions = this.options.filter((option) =>
      labelGetter(option).includes(term)
    );

    this.dropdownVisible = true;
    this.activeIndex = this.filteredOptions.length ? 0 : -1;
  }

  private moveActiveIndex(delta: number): void {
    if (!this.filteredOptions.length) {
      this.activeIndex = -1;
      return;
    }

    this.activeIndex =
      (this.activeIndex + delta + this.filteredOptions.length) %
      this.filteredOptions.length;
  }

  @HostListener("document:click", ["$event"])
  handleDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.dropdownVisible = false;
    }
  }
}
