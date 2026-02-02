import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { UserType } from '@models/users.model';

export interface User {
  [prop: string]: any;
  id?: number | null;
  code?: number | null;
  fullName?: string;
  email?: string;
  gender?: string;
  birthDate?: string;
  mobile?: string;
  role?: UserType;
  password?: string;
  roles?: string[];
  permissions?: string[];
}

export interface Token {
  [prop: string]: any;

  access_token: string;
  token_type?: string;
  expires_in?: number;
  exp?: number;
  refresh_token?: string;
}

export interface Entity<T = string | number> {
  [prop: string]: any;
  id?: T;
  name: string;
}

export interface EntityForm<T = string | number | undefined> {
  [prop: string]: AbstractControl<any>;
  id: FormControl<T>;
  name: FormControl<string>;
}

export interface UserForm {
  id: FormControl<number | null>;
  fullName: FormControl<string | null>;
  email: FormControl<string | null>;
  gender: FormControl<string | null>;
  birthDate: FormControl<string | null>;
  mobile: FormControl<string | null>;
  role: FormControl<UserType | null>;
  roles?: FormControl<string[] | null>;
  permissions?: FormControl<string[] | null>;
  address?: FormGroup<any>;
  schools: FormArray;
  password?: FormControl<string | null>;
}

export interface ClassForm {
  id: FormControl<number | null>;
  code: FormControl<string | null>;
  degreeId: FormControl<string | null>;
  yearId: FormControl<string | null>;
  suffixId: FormControl<string | null>;
  dayShiftId: FormControl<string | null>;
  school: FormGroup<any>;
}
