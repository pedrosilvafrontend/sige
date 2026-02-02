import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogClose, MatDialogActions,
} from '@angular/material/dialog';
import { Component, Inject, LOCALE_ID } from '@angular/core';
import { SchoolsService } from '@services/schools.service';
import {
  UntypedFormControl,
  Validators,
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
} from '@angular/forms';
import { School } from '@models';
import {
  DateAdapter,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
  MatOptionModule,
} from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { AddressFormComponent } from '@modules/address/address-form/address-form.component';
import { SchoolsUtils } from '../../schools.utils';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { SchoolForm } from '@form';
import { JsonPipe } from '@angular/common';
import { format, parse } from 'date-fns';
import { Button } from '@ui/button/button';

export interface DialogData {
  id: number;
  action: string;
  table: School;
}

@Component({
  selector: 'app-school-form-dialog',
  templateUrl: './school-form-dialog.component.html',
  styleUrls: ['./school-form-dialog.component.scss'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'pt' },
    { provide: LOCALE_ID, useValue: window.navigator.language },
    provideNgxMask({})
  ],
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
    NgxMaskDirective,
    Button,
    MatDialogActions,
    // JsonPipe,
  ],
})
export class SchoolFormDialogComponent {
  public action: string;
  public dialogTitle: string;
  public form: FormGroup;
  public table: School;
  public url: string | null = null;
  public utils = SchoolsUtils;

  constructor(
    public dialogRef: MatDialogRef<SchoolFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public service: SchoolsService,
    private adapter: DateAdapter<any>
  ) {
    this.adapter.setLocale('pt-BR');
    // Set the defaults
    this.action = data.action;
    if (this.action === 'edit' || this.action == 'view') {
      this.dialogTitle = data.table.name;
      this.table = data.table;
    } else {
      this.dialogTitle = 'New record';
      this.table = new School();
    }
    this.form = SchoolForm.form(this.table);

    if (this.action === 'view') {
      this.form.disable();
    }
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

  onNoClick(): void {
    this.dialogRef.close();
  }

  submit() {
    if (this.form.valid) {
      const formData = this.form.getRawValue();
      if (formData.foundationDate) {
        const dateObject = parse(formData.foundationDate, 'dd/MM/yyyy', new Date());
        if (dateObject.toString() === 'Invalid Date') {
          console.error('Invalid date format:', formData.foundationDate);
          return;
        }
        formData.foundationDate = format(dateObject, "yyyy-MM-dd");
      }

      if (this.action === 'edit') {
        // Update existing leave request

        this.service.updateSchool(formData).subscribe({
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
        this.service.addSchool(formData).subscribe({
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

  addControl(controlName: string, form: FormGroup) {
    console.log('addControl', controlName, form);
    this.form.addControl(controlName, form);
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

  addAddressForm(form: FormGroup<any>) {
    if (this.action === 'view') {
      form.disable();
    }
    this.form.addControl('address', form)
  }
}
