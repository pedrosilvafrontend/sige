import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Inject,
  OnDestroy,
  OnInit
} from '@angular/core';
import {
  UntypedFormControl,
  Validators,
  UntypedFormGroup,
  UntypedFormBuilder,
  FormsModule,
  ReactiveFormsModule,
  FormGroup
} from '@angular/forms';
import { EventService, LessonsService } from '@services';
import { Calendar } from '../../calendar.model';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { LessonFormComponent } from '@modules/lessons';
import { Subject, takeUntil } from 'rxjs';
import { Util } from '@core/util/util';
import { Datepicker } from '@ui/field/datepicker/datepicker';
import { Button } from '@ui/button/button';
import { ILessonForm, LessonBatch } from '@models';
import { LessonForm } from '@form/lesson.form';

export interface DialogData {
  lessonId?: number;
  categories: string[];
  id: number;
  action: string;
  calendar: Calendar;
}

@Component({
  selector: 'app-event-dialog',
  templateUrl: './event-dialog.component.html',
  styleUrls: ['./event-dialog.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDialogContent,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    TranslateModule,
    LessonFormComponent,
    Datepicker,
    Button,
    MatDialogActions,
    MatDialogClose,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventDialogComponent implements OnInit, OnDestroy {
  public action: string;
  public dialogTitle: string;
  public form: UntypedFormGroup;
  public calendar: Calendar;
  public showDeleteBtn = false;
  public eventCategories: string[] = [];
  public lessonData!: LessonBatch;
  private sub = new Subject<void>();
  private cdr = inject(ChangeDetectorRef);
  public objectCompare = Util.objectCompare;

  constructor(
    public dialogRef: MatDialogRef<EventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public calendarService: EventService,
    public lessonsService: LessonsService,
    private fb: UntypedFormBuilder
  ) {
    // Set the defaults
    this.action = data.action;
    this.eventCategories = data.categories;
    if (this.action === 'edit') {
      this.dialogTitle = data.calendar.groupId === 'LESSON' ? 'Edit lesson' : 'Edit event';
      this.calendar = data.calendar;
      this.showDeleteBtn = true;
    } else {
      this.dialogTitle = 'New Event';
      const blankObject = {} as Calendar;
      this.calendar = new Calendar(blankObject);
      this.showDeleteBtn = false;
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
    const {
      id, title, groupId, startDate, endDate, details,
    } = this.calendar;
    return this.fb.group({
      id: [+(id || 0) || null],
      title: [title, [Validators.required]],
      category: [groupId || 'LESSON'],
      startDate: [startDate, [Validators.required]],
      endDate: [endDate, [Validators.required]],
      details: [details],
    });
  }

  formObservables() {

    const { category, title, lesson } = this.form.controls;
    const checkCategory = (cat: string) => {
      const isLesson = cat === 'LESSON';
      const action = isLesson ? 'enable' : 'disable';
      lesson?.[action]();
      if (isLesson) {
        title?.disable();
      }
      this.cdr.detectChanges();
    }
    const checkLesson = (lesson: LessonBatch) => {
      const isLesson = category.value?.name === 'LESSON';
      const { fullName } = lesson.teacher || {};
      const teacherName = `${fullName || ''}`.trim();
      const className = `${lesson.schoolClass?.code}`;
      if (isLesson && lesson) {
        const titleValue = [lesson.school?.acronym, className, lesson.curricularComponent?.name, teacherName]
          .filter(v => !!v).join(' - ');
        title?.setValue(titleValue)
      }
    }

    checkCategory(category.value);
    checkLesson(lesson?.value);

    category?.valueChanges
      .pipe(takeUntil(this.sub))
      .subscribe(checkCategory)

    lesson?.valueChanges
      .pipe(takeUntil(this.sub))
      .subscribe(checkLesson)

  }

  addLesson(lessonForm: LessonForm) {
    this.form.addControl('lesson', lessonForm.form);
  }

  ngOnInit() {
    this.formObservables();
    const lessonId = this.data.lessonId || +(this.calendar.lesson?.id || 0);
    if (this.action === 'edit' && lessonId) {
      this.lessonsService.getById(lessonId)
        .pipe(takeUntil(this.sub))
        .subscribe((lesson: LessonBatch) => {
          this.lessonData = lesson;
          this.cdr.detectChanges();
        })
    }
  }

  submit() {
    // empty stuff
  }
  deleteEvent() {
    this.calendarService.deleteCalendar(this.form.getRawValue());
    this.dialogRef.close('delete');
  }
  onCancelClick(): void {
    this.dialogRef.close();
  }
  public confirmAdd(): void {
    const data = this.form.getRawValue();
    if (data.category === 'LESSON') {
      const request$ = data.lesson.id ? this.lessonsService.updateItem(data.lesson) : this.lessonsService.addItem(data.lesson);
      request$.pipe(takeUntil(this.sub)).subscribe((r: any) => {
        if (r) {
          this.dialogRef.close('submit');
        }
      })
    }
    // this.calendarService.addUpdateCalendar(data).then(r => {
    //   if (r) {
    //     this.dialogRef.close('submit')
    //   }
    // });
  }

  ngOnDestroy(): void {
    this.sub.next();
    this.sub.complete();
  }

}
