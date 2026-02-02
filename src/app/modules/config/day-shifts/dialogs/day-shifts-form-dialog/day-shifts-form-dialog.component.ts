import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogClose, MatDialogActions,
} from '@angular/material/dialog';
import { Component, Inject, OnDestroy } from '@angular/core';
import { DayShiftsService } from '../../day-shifts.service';
import {
  Validators,
  UntypedFormGroup,
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  FormBuilder,
} from '@angular/forms';
import { DayShifts } from '../../day-shifts.model';
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
import { distinctUntilChanged, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Button } from '@ui/button/button';

export interface DialogData {
  id: number;
  action: string;
  table: DayShifts;
}

@Component({
  selector: 'app-day-shifts-form-dialog',
  templateUrl: './day-shifts-form-dialog.component.html',
  styleUrls: ['./day-shifts-form-dialog.component.scss'],
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
  ],
})
export class DayShiftsFormDialogComponent implements OnDestroy {
  action: string;
  dialogTitle: string;
  form: FormGroup;
  table: DayShifts;
  url: string | null = null;
  private subs: (Subscription | undefined)[] = [];

  constructor(
    public dialogRef: MatDialogRef<DayShiftsFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public service: DayShiftsService,
    private fb: FormBuilder
  ) {
    // Set the defaults
    this.action = data.action;
    if (this.action === 'edit') {
      this.dialogTitle = data.table.name;
      this.table = new DayShifts(data.table);
    } else {
      this.dialogTitle = '';
      this.table = new DayShifts();
    }
    this.form = this.createForm();
  }

  createForm(): UntypedFormGroup {
    const form = this.fb.group({
      id: [this.table.id, [Validators.required]],
      name: [this.table.name, [Validators.required]],
    });

    this.subs.push(
      form.get('name')?.valueChanges.pipe(
        debounceTime(700),
        distinctUntilChanged()
      ).subscribe((value: string | null) => {
        if (value) {
          form.get('id')?.patchValue(value.trim().replaceAll(' ', '_').toUpperCase());
        }
      })
    )

    return form;
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

  submit() {
    if (this.form.valid) {
      const formData = this.form.getRawValue();

      if (this.action === 'edit') {
        // Update existing leave request

        this.service.update(formData).subscribe({
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
        this.service.add(formData).subscribe({
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

  ngOnDestroy() {
    this.subs.forEach(sub => {
      sub?.unsubscribe();
    })
  }
}
