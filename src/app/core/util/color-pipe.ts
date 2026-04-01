import { inject, Pipe, PipeTransform } from '@angular/core';
import { ColorUtil } from '@util/color.util';
import { FormControl, FormGroup } from '@angular/forms';
import { DynamicForm } from '@core/services/dynamic-form';
import { pipe } from 'rxjs';
import { EvalTools } from '@models/eval-tools';

@Pipe({
  name: 'textColor',
})
export class ColorPipe implements PipeTransform {
  transform(bgColor: string): string {
    return ColorUtil.getContrastYIQ(bgColor);
  }
}

@Pipe({
  name: 'colorStyle',
})
export class ColorStylePipe implements PipeTransform {
  transform(bgColor?: string): { color?: string, backgroundColor?: string } {
    if (!bgColor) {
      return {};
    }
    return { color: ColorUtil.getContrastYIQ(bgColor), backgroundColor: bgColor };
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

@Pipe({
  name: 'activityStatusClass',
})
export class activityStatusClassPipe implements PipeTransform {
  transform(evalTools: EvalTools, prefix?: string): string {
    const statuses = Object.values(evalTools).map((e) => e.status);
    const status = ['REJECTED', 'PENDING_APPROVAL', 'APPROVED'].find(status => statuses.includes(status));
    return status ? `${prefix || ''}${(EvalTools.statusClass as any)[status] || ''}` : '';
  }
}
