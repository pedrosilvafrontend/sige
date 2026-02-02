import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import * as fns from 'date-fns';

export class FormValidators {

  static rangeTimeCtrl(startTime: AbstractControl, endTime: AbstractControl): ValidatorFn {
    return (): ValidationErrors | null => {
      if(!fns.isValid(startTime.value) || !fns.isValid(endTime.value)) {
        return null;
      }
      const start = fns.format(startTime.value, 'HH:mm');
      const end = fns.format(endTime.value, 'HH:mm');
      const valid = fns.isValid(start) && fns.isValid(end) && fns.isBefore(start, end);
      const err = { rangeTime: true };
      if (!valid) {
        startTime.setErrors(err, { emitEvent: false });
        endTime.setErrors(err, { emitEvent: false });
        return err;
      } else {
        startTime.setErrors(null, { emitEvent: false });
        endTime.setErrors(null, { emitEvent: false });
      }
      return null;
    };
  }

  static rangeTime(startKey: string, endKey: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const startControl = formGroup.get(startKey);
      const endControl = formGroup.get(endKey);
      if(!startControl || !endControl || !fns.isValid(startControl.value) || !fns.isValid(endControl.value)) {
        return null;
      }
      const start = fns.format(startControl.value, 'HH:mm');
      const end = fns.format(endControl.value, 'HH:mm');
      const valid = fns.isValid(start) && fns.isValid(end) && fns.isBefore(start, end);
      const err = { rangeTime: true };
      if (!valid) {
        startControl.setErrors(err, { emitEvent: false });
        endControl.setErrors(err, { emitEvent: false });
        return err;
      } else {
        startControl.setErrors(null, { emitEvent: false });
        endControl.setErrors(null, { emitEvent: false });
      }
      return null;
    };
  }

  static dateRange(startDateKey: string, endDateKey: string): ValidatorFn {
    return (formGroup: AbstractControl): { [key: string]: any } | null => {
      const startDateControl = formGroup.get(startDateKey); // Replace 'startDate' with your actual control name
      const endDateControl = formGroup.get(endDateKey);   // Replace 'endDate' with your actual control name

      if (!startDateControl || !endDateControl || !startDateControl.value || !endDateControl.value) {
        return null; // Don't validate if either date is not set
      }

      const startDate = new Date(startDateControl.value);
      const endDate = new Date(endDateControl.value);

      if (startDate.getTime() > endDate.getTime()) {
        return { invalidDateRange: true }; // Return error if start date is not before end date
      }

      return null;
    };
  }

  static requiredIf(keys: string[]): ValidatorFn {
    return (formGroup: AbstractControl): { [key: string]: any } | null => {
      const formValue = formGroup.value;
      const has = keys.some((key: string) => !!formValue[key]);
      return has ? { required: keys } : null;
    }
  }

}
