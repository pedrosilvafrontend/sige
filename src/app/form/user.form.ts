import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from '@core/models/interface';

export class UserForm {
  private static fb = new FormBuilder();

  static form(data?: User, minimal?: boolean): FormGroup<IUserForm> {
    const ctrls = {
      id: [data?.id],
      code: [data?.code],
      fullName: [data?.fullName, [Validators.required]],
      email: [
        data?.email,
        [Validators.required, Validators.email, Validators.minLength(5)],
      ],
    };
    if (!minimal) {
      Object.assign(ctrls, {
        birthDate: [data?.birthDate],
        gender: [data?.gender],
        mobile: [data?.mobile],
        role: [data?.role],
        roles: [data?.roles],
        permissions: [data?.permissions],
      })
    }
    return this.fb.group(ctrls);
  }


}

export interface IUserForm {
  id: FormControl<number | null | undefined>;
  code: FormControl<number | null | undefined>;
  fullName: FormControl<string | null | undefined>;
  email: FormControl<string | null | undefined>;
  birthDate?: FormControl<string | null>;
  gender?: FormControl<string | null>;
  mobile?: FormControl<string | null>;
  role?: FormControl<string | null>;
  roles?: FormControl<string[] | null>;
  permissions?: FormControl<string[] | null>;
  img?: FormControl<string | null>;
}

