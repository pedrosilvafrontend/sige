import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogClose, MatDialog, MatDialogActions,
} from '@angular/material/dialog';
import { Component, Inject, OnDestroy } from '@angular/core';
import {
  UntypedFormControl,
  Validators,
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  FormBuilder, FormArray, FormControl,
} from '@angular/forms';
import {
  MAT_DATE_LOCALE,
  MatNativeDateModule,
  MatOptionModule,
} from '@angular/material/core';
import { JsonPipe } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { AddressFormComponent } from '@modules/address/address-form/address-form.component';
import { FValidators as V } from '@core/util/validators';
import { School, User, UserForm  } from '@models';
import { MatTooltip } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';
import { SchoolListSelectComponent } from '@modules/schools/school-list-select/school-list-select.component';
import { UserTable, UserType } from '@modules/users/users.model';
import { UserService } from '@modules/users/user.service';
import { Button } from '@ui/button/button';
import { format } from 'date-fns';

export interface UserDialogData {
  id: number;
  action: string;
  user: User | UserTable;
  submit$: Subject<User>;
}

@Component({
  selector: 'app-user-form-dialog',
  templateUrl: './user-form-dialog.component.html',
  styleUrls: ['./user-form-dialog.component.scss'],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }],
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDialogContent,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatDatepickerModule,
    MatSelectModule,
    MatOptionModule,
    MatDialogClose,
    MatNativeDateModule,
    TranslateModule,
    AddressFormComponent,
    MatTooltip,
    Button,
    MatDialogActions,
  ],
})
export class UserFormDialogComponent implements OnDestroy {
  action: string;
  dialogTitle: string;
  form: FormGroup<UserForm>;
  user!: User;
  url: string | null = null;
  userTypes: UserType[] = ['admin', 'principal', 'coordinator', 'teacher', 'association'];
  private sub = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<UserFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserDialogData,
    public service: UserService,
    private fb: FormBuilder,
    private dialog: MatDialog,
  ) {
    // Set the defaults
    this.action = data.action;
    if (this.action === 'edit') {
      this.dialogTitle = data.user.fullName || '';
      this.user = data.user;
    } else {
      this.dialogTitle = 'newUser';
      this.user = { ...new UserTable(), ...data.user };
    }
    this.form = this.createForm(data.user);
  }
  formControl = new UntypedFormControl('', [
    Validators.required,
    // Validators.email,
  ]);
  getErrorMessage() {
    return this.formControl.hasError('required')
      ? 'Required field'
      : this.formControl.hasError('email')
      ? 'Not a valid email'
      : '';
  }

  phoneNumber(phone: string) {
    const regex = /(\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})/g;
    return regex.exec(phone)?.[0] || (
      phone.length > 10 ? phone.substr(0, 10) : phone
    );
    // phone number validation
    // var regex = /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
    // regex.test('+1 (615) 243-5172'); // returns true
  }

  openSchoolSelection() {
    this.dialog.open(SchoolListSelectComponent, {
      width: '1400px',
      minWidth: '60vw',
      maxWidth: '100vw',
      data: { form: this.form.controls.schools },
      autoFocus: 'input',
      disableClose: true
    });
  }

  schoolSelect(form: FormGroup) {
    form.get('id')?.valueChanges
      .pipe(takeUntil(this.sub))
      .subscribe((id: any) => {
        if(!id) return;
        this.form.controls.schools.push(form);
      })
  }

  createForm(data: any): FormGroup<UserForm> {
    if(!data) {
      data = {};
    }
    const schools: FormArray<FormControl<School | null>> = this.fb.array(data['schools'] || []);
    const birthDate = data.birthDate ? format(data.birthDate as any, 'yyyy-MM-dd') : null;

    return this.fb.group({
      id: [data.id],
      fullName: [data.fullName, [Validators.required]],
      email: [
        data.email,
        [Validators.required, Validators.email, Validators.minLength(5)],
      ],
      gender: [data.gender],
      birthDate: [birthDate, [Validators.required]],
      mobile: [data.mobile, [Validators.required, V.phone()]],
      role: [data.role, [Validators.required]],
      schools
    }) as FormGroup<UserForm>;
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

  submit() {
    if (this.form.valid) {
      const formData: any = this.form.getRawValue();

      if (this.data?.submit$) {
        this.data.submit$.next(formData);
        return;
      }

      if (this.action === 'edit') {
        // Update existing leave request

        this.service.updateItem(formData).subscribe({
          next: (response) => {
            // console.log('Update Response:', response);
            this.dialogRef.close(response); // Close with the response data
          },
          error: (error) => {
            console.error('Update Error:', error);
            // Handle error if necessary
          },
        });
      } else {
        // Add new leave request
        this.service.addItem(formData).subscribe({
          next: (response) => {
            // console.log('Add Response:', response);
            this.dialogRef.close(response); // Close with the response data
          },
          error: (error) => {
            console.error('Add Error:', error);
            // Handle error if necessary
          },
        });
      }
    }
  }

  onSelectFile(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      const reader = new FileReader();

      reader.readAsDataURL(target.files[0]); // read file as data url

      reader.onload = (e) => {
        if (e.target) {
          this.url = e.target.result as string; // Explicitly cast to avoid undefined
        }
      };
    }
  }

  // onImageUpload(event: Event): void {
  //   const target = event.target as HTMLInputElement;
  //
  //   if (target.files && target.files.length > 0) {
  //     const file = target.files[0];
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       const base64Img = reader.result as string;
  //       this.form.patchValue({ img: base64Img });
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // }

  ngOnDestroy() {
    this.sub.next();
    this.sub.complete();
  }

}
