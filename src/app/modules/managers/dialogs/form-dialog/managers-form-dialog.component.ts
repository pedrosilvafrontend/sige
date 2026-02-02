import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogClose, MatDialog, MatDialogActions,
} from '@angular/material/dialog';
import { Component, Inject, OnDestroy } from '@angular/core';
import { UserService } from '../../../users/user.service';
import {
  UntypedFormControl,
  Validators,
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  FormBuilder, FormArray, FormControl,
} from '@angular/forms';
import { UserTable } from '../../../users/users.model';
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
import { UserForm } from '@core/models/interface';
import { School } from '@models';
import { Subject, takeUntil } from 'rxjs';
import { SchoolListSelectComponent } from '@modules/schools/school-list-select/school-list-select.component';
import { Button } from '@ui/button/button';
import { format } from 'date-fns';

export interface DialogData {
  id: number;
  action: string;
  userTable: UserTable;
}

@Component({
  selector: 'app-managers-form-dialog',
  templateUrl: './managers-form-dialog.component.html',
  styleUrls: ['./managers-form-dialog.component.scss'],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
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
    MatDialogActions,
    Button,
  ],
})
export class ManagersFormDialogComponent implements OnDestroy {
  action: string;
  dialogTitle: string;
  form: FormGroup<UserForm>;
  table: UserTable;
  url: string | null = null;
  hide = true;
  private sub = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<ManagersFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public service: UserService,
    private fb: FormBuilder,
    private dialog: MatDialog,
  ) {
    // Set the defaults
    this.action = data.action;
    if (this.action === 'edit') {
      this.dialogTitle = data.userTable.fullName;
      this.table = data.userTable;
    } else {
      this.dialogTitle = 'New record';
      this.table = new UserTable();
    }
    this.form = this.createForm();
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

  createForm(): FormGroup<UserForm> {
    const schools: FormArray<FormControl<School | null>> = this.fb.array(this.table.schools || []);

    const { id, fullName, email, gender, birthDate, mobile, role } = this.table;

    return this.fb.group({
      id: [id],
      fullName: [fullName, [Validators.required]],
      email: [
        email,
        [Validators.required, Validators.email, Validators.minLength(5)],
      ],
      gender: [gender],
      birthDate: [
        birthDate ? format(birthDate, 'yyyy-MM-dd') : '',
      ],
      mobile: [mobile],
      // mobile: [mobile, [V.phone()]],
      role: [role, [Validators.required]],
      password: ['', [Validators.required]],
      schools
    }) as FormGroup<UserForm>;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  submit() {
    if (this.form.valid) {
      const formData: any = this.form.getRawValue();

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
