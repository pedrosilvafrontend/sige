import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Util } from '@core/util/util';

export class FValidators {

  static phone(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return !Util.isPhone(control.value) ? {phone: {value: control.value}} : null;
    };
  }

}
