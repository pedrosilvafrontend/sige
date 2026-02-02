import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogClose, MatDialogActions,
} from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { CurricularComponentsListService } from '../../curricular-components-list.service';
import {
  UntypedFormControl,
  Validators,
  UntypedFormGroup,
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  FormBuilder,
} from '@angular/forms';
import {
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
import { Button } from '@ui/button/button';
import { CurricularComponent } from '@models/curricular-component.model';
import { Field } from '@ui/field/field';

export interface DialogData {
  id: number;
  action: string;
  table: CurricularComponent;
}

@Component({
  selector: 'app-curricular-component-form-dialog',
  templateUrl: './curricular-component-form-dialog.component.html',
  styleUrls: ['./curricular-component-form-dialog.component.scss'],
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
    Button,
    MatDialogActions,
    Field,
  ],
})
export class CurricularComponentFormDialogComponent {
  action: string;
  dialogTitle: string;
  form: FormGroup;
  table: CurricularComponent;
  url: string | null = null;
  constructor(
    public dialogRef: MatDialogRef<CurricularComponentFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public service: CurricularComponentsListService,
    private fb: FormBuilder
  ) {
    // Set the defaults
    this.action = data.action;
    if (this.action === 'edit') {
      this.dialogTitle = data.table.name;
      this.table = data.table;
    } else {
      this.dialogTitle = '';
      this.table = new CurricularComponent();
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
  createForm(): UntypedFormGroup {
    return this.fb.group({
      id: [this.table.id],
      code: [this.table.code, [Validators.required]],
      name: [this.table.name, [Validators.required]],
    });
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

  submit() {
    if (this.form.valid) {
      const formData = this.form.getRawValue();

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
}
