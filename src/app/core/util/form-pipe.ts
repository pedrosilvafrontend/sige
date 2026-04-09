import { inject, Pipe, PipeTransform } from '@angular/core';
import { DynamicForm } from '@core/services/dynamic-form';
import { FormControl, FormGroup } from '@angular/forms';

@Pipe({
  name: 'form',
})
export class FormPipe implements PipeTransform {
  private dynamicForm = inject(DynamicForm);

  transform(form: FormGroup, key: string, initialValue?: any): FormControl {
    if (form && key) {
      if (!form.get(key)) {
        this.dynamicForm.addControlByPath(form, key, initialValue);
      }
      return form.get(key) as FormControl;
    }
    const control = new FormControl();
    control.disable()
    return control;
  }
}
