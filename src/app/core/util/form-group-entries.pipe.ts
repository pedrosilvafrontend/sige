import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl, UntypedFormControl } from '@angular/forms';

@Pipe({
  name: 'formGroupEntries',
  standalone: true
})
export class FormGroupEntriesPipe implements PipeTransform {

  transform(form: AbstractControl | null, ...args: unknown[]): [string, UntypedFormControl][] {
    if (!form) {
      return [];
    }
    return Object.entries((form as any).controls);
  }

}
