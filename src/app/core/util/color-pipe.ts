import { inject, Pipe, PipeTransform } from '@angular/core';
import { ColorUtil } from '@util/color.util';
import { FormControl, FormGroup } from '@angular/forms';
import { DynamicForm } from '@core/services/dynamic-form';

@Pipe({
  name: 'textColor',
})
export class ColorPipe implements PipeTransform {
  transform(bgColor: string): string {
    return ColorUtil.getContrastYIQ(bgColor);
  }
}


@Pipe({
  name: 'getControl',
})
export class getControl implements PipeTransform {
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
