import { Component, effect, forwardRef, input, OnDestroy, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { Editor, NgxEditorComponent, NgxEditorMenuComponent, Toolbar } from 'ngx-editor';
import { ControlValueAccessor, FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ui-text-editor',
  imports: [
    NgxEditorMenuComponent,
    NgxEditorComponent,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './text-editor.html',
  styleUrl: './text-editor.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextEditor),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  encapsulation: ViewEncapsulation.None
})
export class TextEditor implements OnInit, OnDestroy, ControlValueAccessor {
  control = new FormControl();
  editor!: Editor
  private valueChangesSub?: Subscription;
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  disabled = input(false);

  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];

  constructor() {
    effect(() => {
      if (this.disabled()) {
        this.control.disable();
      } else {
        this.control.enable();
      }
    });
  }

  ngOnInit(): void {
    this.editor = new Editor();
    this.valueChangesSub = this.control.valueChanges.subscribe(value => {
      this.onChange((value ?? '') as string);
    });
  }

  ngOnDestroy(): void {
    this.valueChangesSub?.unsubscribe();
    this.editor.destroy();
  }

  writeValue(value: string | null): void {
    this.control.setValue(value ?? '', { emitEvent: false });
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.control.disable({ emitEvent: false });
      return;
    }

    this.control.enable({ emitEvent: false });
  }

  handleBlur(): void {
    this.onTouched();
  }
}
