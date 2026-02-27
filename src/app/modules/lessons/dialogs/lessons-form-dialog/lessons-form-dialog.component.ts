import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogClose, MatDialogActions,
} from '@angular/material/dialog';
import { Component, inject, input, OnDestroy, OnInit, output } from '@angular/core';
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
} from '@angular/forms';
import {
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
import { School, SchoolClass, CurricularComponent, LessonBatch, ILessonForm } from '@models';
import { UserTable } from '../../../users/users.model';
import { LessonFormComponent } from '@modules/lessons';
import { AuthService, LessonsService } from '@services';
import { Button } from '@ui/button/button';
import { BehaviorSubject, merge, Subject, takeUntil } from 'rxjs';
import { LessonForm } from '@form/lesson.form';

export interface DialogData {
  id: number;
  action: string;
  table: LessonBatch;
}

@Component({
  selector: 'app-lessons-form-dialog',
  templateUrl: './lessons-form-dialog.component.html',
  styleUrls: ['./lessons-form-dialog.component.scss'],
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
    LessonFormComponent,
    Button,
    MatDialogActions
  ],
})
export class LessonsFormDialogComponent implements OnInit, OnDestroy {
  public dialogRef = inject(MatDialogRef<LessonsFormDialogComponent>);
  public dialogData = inject(MAT_DIALOG_DATA);
  private lessonsService = inject(LessonsService);
  private authService = inject(AuthService);
  public user = this.authService.user$.value;
  public isTeacher = this.user.role === 'teacher';
  public action: string;
  public dialogTitle: string;
  public form: FormGroup<ILessonForm> = this.dialogData.form as FormGroup<ILessonForm>;
  public lessonForm$ = output<LessonForm>();
  public data: LessonBatch;
  public url: string | null = null;
  public classes: SchoolClass[] = [];
  public teachers: UserTable[] = [];
  public schools: School[] = [];

  constructor() {
    const data = this.dialogData.table;
    if (data?.id) {
      this.dialogTitle = this.dialogData.table.curricularComponent?.name || '';
      this.data = this.dialogData.table;
      this.action = 'edit';
    } else {
      this.dialogTitle = 'New record';
      this.data = Object.assign(new LessonBatch(), this.dialogData.table || {});
      this.action = 'add';
    }
  }

  addToGrid() {
    this.dialogRef.close({ submit: true, value: this.form.getRawValue() });
  }

  submit() {
    if (this.form.valid) {
      const data = this.form.value as LessonBatch;
      // if (data.frequency === 'UNIQUE') {
      //   data.endDate = undefined;
      // }

      if (this.action === 'edit') {
        this.lessonsService.updateItem(data).subscribe({
          next: (response) => {
            this.dialogRef.close(response);
          },
          error: (error) => {
            console.error('Update Error:', error);
          },
        });
      } else {
        this.lessonsService.addItem(data).subscribe({
          next: (response) => {
            this.dialogRef.close(response);
          },
          error: (error) => {
            console.error('Add Error:', error);
          },
        });
      }
    }
  }

  setLessonForm(lessonForm: LessonForm) {
    this.lessonForm$.emit(lessonForm);
    this.form = lessonForm.form;
  }

  // formChanges() {
  //   const form = this.form;
  //   const fieldChange = () => {
  //     const { school, schoolClass, teacher, curricularComponent } = form.getRawValue();
  //     if (school?.id && schoolClass?.code && teacher?.id && curricularComponent?.id) {
  //       this.lessonsService.getAll({
  //         schoolId: school.id,
  //         classCode: schoolClass.code,
  //         curricularComponentId: curricularComponent.id,
  //         teacherId: teacher.id,
  //       }).subscribe(response => {
  //         if (!response?.[0]) return;
  //         this.form.patchValue(response[0] as any, { emitEvent: false });
  //       })
  //     }
  //   }
  //   if (!form) return;
  //   const { school, schoolClass, teacher, curricularComponent } = this.form.controls;
  //   school?.valueChanges.pipe(takeUntil(this.form$)).subscribe(fieldChange.bind(this));
  //   schoolClass?.valueChanges.pipe(takeUntil(this.form$)).subscribe(fieldChange.bind(this));
  //   teacher?.valueChanges.pipe(takeUntil(this.form$)).subscribe(fieldChange.bind(this));
  //   curricularComponent?.valueChanges.pipe(takeUntil(this.form$)).subscribe(fieldChange.bind(this));
  // }

  ngOnInit() {
    // if (this.dialogData.form) {
    //   this.formChanges();
    // }
  }

  ngOnDestroy() {
  }
}
