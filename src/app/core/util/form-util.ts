import { Address } from '@modules/address/address';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

export class FormUtil {
  static fb = new FormBuilder();

  static addressForm(data?: Address): UntypedFormGroup {
    const form = this.fb.group({
      id: [0],
      address: ['', Validators.required],
      number: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['Brasil', Validators.required],
      postalCode: ['', Validators.required],
    });

    form.patchValue(data || {});

    return form;
  }

  static compare( a: any, b: any ) : boolean {
    return String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();
  }

  static objectCompare( option: any, value: any ) : boolean {
    return option.id === value.id;
  }
}
