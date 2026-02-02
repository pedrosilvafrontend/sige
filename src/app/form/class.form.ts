import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SchoolClass, Entity } from '@models';
import { ISchoolForm, SchoolForm } from '@form';

export class ClassForm {
  private static fb = new FormBuilder();

  static form(data?: Partial<SchoolClass>, minimal?: boolean): FormGroup<IClassForm> {
    const ctrls = {
      id: [data?.id || null],
      yearId: [data?.yearId || null, [Validators.required]],
      suffixId: [data?.suffixId || null, [Validators.required]],
      dayShiftId: [data?.dayShiftId || null, [Validators.required]],
      school: SchoolForm.form(data?.school || undefined, minimal) // [data?.school || null, [Validators.required]],
    };
    if (!minimal) {
      Object.assign(ctrls, {})
    }
    return this.fb.group(ctrls);
  }


}

export interface IClassForm {
  id: FormControl<number | null>;
  yearId: FormControl<string | null>;
  suffixId: FormControl<string | null>;
  dayShiftId: FormControl<string | null>;
  school: FormGroup<ISchoolForm>;
}

