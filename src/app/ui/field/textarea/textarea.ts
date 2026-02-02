import { ChangeDetectionStrategy, Component, forwardRef, inject, input, ViewEncapsulation } from '@angular/core';
import { Field } from '../field';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ui-textarea',
  imports: [
    MatFormField,
    MatInput,
    MatLabel
  ],
  templateUrl: './textarea.html',
  styleUrl: './textarea.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Textarea),
      multi: true,
    },
  ],
  encapsulation: ViewEncapsulation.None
})
export class Textarea extends Field {
  height = input('5em')
  rows = input<string>('2');
  cols = input<string>('20');
}
