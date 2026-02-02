import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { School } from '@models';
import { format, parse } from 'date-fns';

export class SchoolForm {
  private static fb = new FormBuilder();

  static form(data?: School, minimal?: boolean): FormGroup<ISchoolForm> {
    let foundationDate = data?.foundationDate;
    if (foundationDate) {
      if (RegExp(/^\d{4}-\d{2}-\d{2}/).test(foundationDate)) {
        const dateObject = parse(foundationDate.substring(0, 10), 'yyyy-MM-dd', new Date());
        foundationDate = format(dateObject, "dd/MM/yyyy");
      }
    }
    const ctrls = {
      id: [data?.id],
      name: [data?.name, [Validators.required]],
      acronym: [data?.acronym, [Validators.required]],
    };
    if (!minimal) {
      Object.assign(ctrls, {
        img: [data?.img],
        email: [
          data?.email,
          [Validators.required, Validators.email, Validators.minLength(5)],
        ],
        foundationDate: [foundationDate],
        phone: [data?.phone, [Validators.required]],
      })
    }
    return this.fb.group(ctrls);
  }


}

export interface ISchoolForm {
  id: FormControl<number | null | undefined>;
  name: FormControl<string | null | undefined>;
  acronym: FormControl<string | null | undefined>;
  img?: FormControl<string | null | undefined>;
  email?: FormControl<string | null | undefined>;
  foundationDate?: FormControl<string | null>;
  phone?: FormControl<string | null | undefined>;
}

