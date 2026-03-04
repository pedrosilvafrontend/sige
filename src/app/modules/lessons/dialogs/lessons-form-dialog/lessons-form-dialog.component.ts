import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogClose, MatDialogActions,
} from '@angular/material/dialog';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, output } from '@angular/core';
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
import { LessonForm } from '@form/lesson.form';

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
  private cdr = inject(ChangeDetectorRef);
  public user = this.authService.user$.value;
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

  submit() {
    if (this.form.valid) {
      const data = this.form.getRawValue() as unknown as LessonBatch;

      if (data.id) {
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

  ngOnInit() {
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
  }
}
