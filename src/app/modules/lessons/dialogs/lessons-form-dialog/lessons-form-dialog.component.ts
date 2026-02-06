import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogClose, MatDialogActions,
} from '@angular/material/dialog';
import { Component, inject } from '@angular/core';
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
import { LessonsService } from '@services';
import { Button } from '@ui/button/button';

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
export class LessonsFormDialogComponent {
  public dialogRef = inject(MatDialogRef<LessonsFormDialogComponent>);
  public dialogData = inject(MAT_DIALOG_DATA);
  public lessonsService = inject(LessonsService);
  public action: string;
  public dialogTitle: string;
  public form!: FormGroup<ILessonForm>;
  public data: LessonBatch;
  public url: string | null = null;
  public classes: SchoolClass[] = [];
  public teachers: UserTable[] = [];
  public curricularComponents: CurricularComponent[] = [];
  public schools: School[] = [];

  constructor() {
    this.action = this.dialogData.action;
    if (this.action === 'edit') {
      this.dialogTitle = this.dialogData.table.curricularComponent?.name || '';
      this.data = this.dialogData.table;
    } else {
      this.dialogTitle = 'New record';
      this.data = new LessonBatch();
    }
  }

  submit() {
    if (this.dialogData.blockSubmit) {
      this.dialogRef.close({ submit: true, value: this.form.getRawValue() });
      return;
    }

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

  setForm(form: FormGroup<ILessonForm>) {
    this.form = form;
  }
}
