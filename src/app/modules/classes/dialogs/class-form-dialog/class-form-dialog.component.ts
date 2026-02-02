import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { ClassesService } from '@services';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { SchoolClass } from '@models';
import { MAT_DATE_LOCALE, MatNativeDateModule, MatOptionModule, } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { DayShiftsService, ClassYearsService, ClassSuffixesService } from '@services';
import { DayShifts, School } from '@models';
import { SchoolsService } from '@services';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { Util } from '@core/util/util';
import { Button } from '@ui/button/button';
import { Degree } from '@models/degree.model';
import { DegreesService } from '@services/degrees.service';
import { FilterPipe } from '@util/filter-pipe';

export interface DialogData {
  id: number;
  action: string;
  table: SchoolClass;
}

@Component({
  selector: 'app-class-form-dialog',
  templateUrl: './class-form-dialog.component.html',
  styleUrls: ['./class-form-dialog.component.scss'],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    FilterPipe,
  ],
  encapsulation: ViewEncapsulation.None
})
export class ClassFormDialogComponent implements OnInit, OnDestroy {
  private schoolsService = inject(SchoolsService);
  private dayShiftsService = inject(DayShiftsService);
  private classYearsService = inject(ClassYearsService);
  private classSuffixesService = inject(ClassSuffixesService);
  private classesService = inject(ClassesService);
  private degreesService = inject(DegreesService);
  private subDestroy = new Subject<void>();
  private fb = inject(FormBuilder);
  public data: DialogData = inject(MAT_DIALOG_DATA);
  public dialogRef = inject(MatDialogRef<ClassFormDialogComponent>);

  action: string;
  dialogTitle: string;
  form: FormGroup;
  schoolClass: SchoolClass;
  url: string | null = null;
  dayShifts: DayShifts[] = [];
  schools: School[] = [];
  degrees: Degree[] = [];
  classYears: {id: string, name: string}[] = [];
  classSuffixes: {id: string, name: string}[] = [];
  objectCompare = Util.objectCompare;

  constructor() {
    // Set the defaults
    this.action = this.data.action;
    if (this.action === 'edit') {
      this.dialogTitle = this.data.table.code || '';
      this.schoolClass = this.data.table;
    } else {
      this.dialogTitle = 'New record';
      this.schoolClass = new SchoolClass();
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
    const form = this.fb.group({
      id: [this.schoolClass.id],
      code: [this.schoolClass.code],
      degreeId: [this.schoolClass.degreeId],
      yearId: [this.schoolClass.yearId, [Validators.required]],
      suffixId: [this.schoolClass.suffixId, [Validators.required]],
      dayShiftId: [this.schoolClass.dayShiftId, [Validators.required]],
      school: this.fb.group({
        id: [this.schoolClass.school?.id, [Validators.required]],
        name: [this.schoolClass.school?.name, [Validators.required]],
        acronym: [this.schoolClass.school?.acronym],
      }),
    });

    form.controls.code.disable();
    this.formChanges(form);
    return form;
  }

  formChanges(form: FormGroup): void {
    form.valueChanges.pipe(takeUntil(this.subDestroy)).subscribe({
      next: data => {
        const code = [data.yearId || '', data.dayShiftId, data.suffixId].join('');
        this.form.controls['code'].setValue(code, { emitEvent: false });
      }
    })
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  submit() {
    if (this.form.valid) {
      const formData = this.form.getRawValue();

      if (this.action === 'edit') {
        // Update existing leave request

        this.classesService.updateItem(formData).subscribe({
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
        this.classesService.addItem(formData).subscribe({
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

  async ngOnInit() {
    this.degrees = await firstValueFrom(this.degreesService.getAll());
    this.classYears = await firstValueFrom(this.classYearsService.getAll());
    this.dayShifts = await firstValueFrom(this.dayShiftsService.getAll());
    this.classSuffixes = await firstValueFrom(this.classSuffixesService.getAll());
    this.schools = await firstValueFrom(this.schoolsService.getAll());

    this.form.patchValue(this.schoolClass)
  }

  ngOnDestroy() {
    this.subDestroy.next();
    this.subDestroy.complete();
  }
}
