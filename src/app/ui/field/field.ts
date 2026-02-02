import { ChangeDetectionStrategy, Component, forwardRef, Input, input, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormsModule } from '@angular/forms';
import { MatFormFieldAppearance, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'ui-field',
  imports: [MatFormFieldModule, MatInputModule, FormsModule, NgxMaskDirective],
  templateUrl: './field.html',
  styleUrl: './field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Field),
      multi: true,
    },
  ],
})
export class Field implements ControlValueAccessor {
  // Inputs
  label = input<string>('');
  type = input<'text' | 'password' | 'email' | 'number' | 'search' | 'tel' | 'url' | string>('text');
  placeholder = input<string>('');
  required = input<boolean>(false);
  appearance = input<MatFormFieldAppearance>('outline');
  name = input<string>('');
  id = input<string>('');
  autocomplete = input<string>('');
  mask = input<string>('');
  cType = input<string>('');
  specialCharacters = input<string[]>([]);
  showMaskTyped = input<boolean>(true);
  dropSpecialCharacters = input<boolean>(true);

  // Internal state for CVA
  private _value = signal<string | number | null>('');
  private _disabled = signal<boolean>(false);

  // Expose value for template binding
  value() { return this._value(); }

  // ControlValueAccessor hooks
  private onChange: (value: unknown) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: unknown): void {
    this._value.set((value as string | number | null) ?? '');
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled.set(!!isDisabled);
  }

  // Events
  handleInput(ev: Event): void {
    const target = ev.target as HTMLInputElement;
    const newVal: string = target.value;
    this._value.set(newVal);
    this.onChange(newVal);
  }

  handleBlur(): void {
    this.onTouched();
  }

  disabled(): boolean { return this._disabled(); }
}
