import { ChangeDetectorRef, Component, inject, input, Input, OnDestroy, OnInit, output, Output } from '@angular/core';
import {
  FormBuilder, FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, firstValueFrom, startWith, Subject, takeUntil } from 'rxjs';
import {
  School,
  SchoolClass,
  DayShifts,
  ILessonForm,
  LessonBatch,
  ILessonFrequency, Frequency, TimeSchedule, User
} from '@models';
import { DayShiftsService } from '../../../config/day-shifts/day-shifts.service';
import { AuthService, ClassesService, LessonsService } from '@services';
import { Util } from '@util/util';
import { SchoolSelectComponent } from '@modules/schools/school-select/school-select.component';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatInput } from '@angular/material/input';
import { provideNgxMask } from 'ngx-mask';
import { FormValidators } from '@form';
import {
  CurricularComponentSelectComponent
} from '@modules/config/curricular-components-list/curricular-component-select/curricular-component-select.component';
import { Button } from '@ui/button/button';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { TeacherSelectComponent } from '@modules/teachers/teacher-select/teacher-select.component';
import { ClassSelectComponent } from '@modules/classes/class-select/class-select.component';
import { ConfigService } from '@modules/config/config/config.service';
import { ConfigData } from '@models/config.model';
import { TimeScheduleService } from '@services/time-schedule.service';
import { TimeScheduleSelect } from '@modules/lessons/time-schedule-select/time-schedule-select';
import { LessonForm } from '@form/lesson.form';

@Component({
  selector: 'app-lesson-form',
  standalone: true,
  imports: [
    FormsModule,
    MatError,
    MatFormField,
    MatLabel,
    MatOption,
    MatSelect,
    ReactiveFormsModule,
    TranslateModule,
    SchoolSelectComponent,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatInput,
    MatSuffix,
    CurricularComponentSelectComponent,
    Button,
    MatIcon,
    MatIconButton,
    TeacherSelectComponent,
    ClassSelectComponent,
    TimeScheduleSelect,
  ],
  providers: [
    provideNgxMask({})
  ],
  templateUrl: './lesson.form.component.html',
  styleUrl: './lesson.form.component.scss'
})
export class LessonFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private dayShiftsService = inject(DayShiftsService);
  private classesService = inject(ClassesService);
  private configService = inject(ConfigService);
  private timeScheduleService = inject(TimeScheduleService);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);
  private lessonsService = inject(LessonsService);
  public auth: User = this.authService.user$.value;
  public lessonForm: LessonForm = new LessonForm(this.auth);
  // public form: FormGroup<ILessonForm>;
  public dayShifts: DayShifts[] = [];
  public classes: SchoolClass[] = [];
  public timeSchedules: TimeSchedule[] = [];
  public schools: School[] = [];
  public frequencies: string[] = ['UNIQUE', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  public objectCompare = Util.objectCompare;
  private destroy$ = new Subject<void>();
  public schoolId: number | null = null;
  private _data!: LessonBatch;
  public configs!: ConfigData;
  public lessonKey = '';

  public lessonForm$ = output<LessonForm>();

  // @Input()
  // set lessonForm(lessonForm: LessonForm) {
  //   this._lessonForm = lessonForm;
  //   if (this.data) {
  //     this.lessonForm.patchValue(this.data as any);
  //   }
  //   this.cdr.detectChanges();
  // }

  // get lessonForm(): LessonForm {
  //   return this._lessonForm;
  // }

  get form(): FormGroup<ILessonForm> {
    return this.lessonForm.form;
  }

  @Input()
  origin = '';

  @Input()
  set data(data: LessonBatch) {
    this._data = data;
    if (this.lessonForm && data) {
      this.lessonForm.patchValue(data as any);
    }
  }
  get data(): LessonBatch {
    return this._data || {} as LessonBatch;
  }

  selectClass(classData: SchoolClass) {
    const { id, code, degreeId, yearId, suffixId } = classData as any || {};
    this.form.patchValue({ schoolClass: { id, code, degreeId, yearId, suffixId } });
  }

  async ngOnInit() {
    // if (!this.lessonForm) {
    //   this.lessonForm = new LessonForm(this.auth, this.data);
    // }
    this.lessonForm$.emit(this.lessonForm);

    const dayShifts = await firstValueFrom(this.dayShiftsService.getAll());
    this.dayShifts.length = 0;
    Object.assign(this.dayShifts, dayShifts);

    this.formCheck();
    this.formObservables();
    this.cdr.detectChanges();
  }

  formCheck() {
    if (this.origin != 'grid') {
      return;
    }
    const { schoolClass, school, frequencies } = this.form.controls;
    [schoolClass, school, frequencies].forEach((ctrl: any) => ctrl.disable?.());
  }

  async getClasses(schoolId?: number) {
    this.schoolId = null;
    let classes: SchoolClass[] = [];
    if (schoolId) {
      const response = await firstValueFrom(this.classesService.getAll(schoolId));
      classes = response?.data || [];
    }
    this.classes = classes || [];
    this.schoolId = schoolId || null;
    this.cdr.detectChanges();
  }

  async getConfigs(schoolId?: number) {
    const params: any = {};
    if (schoolId) {
      params.schoolId = schoolId;
    }
    const configs = await firstValueFrom(this.configService.getConfig(params));
    this.configs = {
      ...configs.school,
      startFirstSemester: configs.school.startFirstSemester || configs.association.startFirstSemester,
      endSecondSemester: configs.school.endSecondSemester || configs.association.endSecondSemester,
      startSecondSemester: configs.school.startSecondSemester || configs.association.startSecondSemester,
      endFirstSemester: configs.school.endFirstSemester || configs.association.endFirstSemester,
    } as ConfigData

    this.checkDates();
  }

  // async getTimeSchedule(classData: Partial<SchoolClass>) {
  //   // const data = this.form.value;
  //   const params = {
  //     classId: classData?.id,
  //     // schoolId: classData?.school?.id,
  //     // degreeId: classData?.degreeId,
  //     // dayShiftId: classData?.dayShiftId
  //   }
  //   const response = await firstValueFrom(this.timeScheduleService.getAll(params));
  //   this.timeSchedules = response || [];
  // }

  // patchValue(data?: LessonBatch) {
  //   this.form.patchValue(data as any);
  //   this.form.controls.frequencies.clear();
  //   (data?.frequencies || []).forEach(frequency => {
  //     this.addFrequency(frequency);
  //   })
  // }

  // createForm(data?: LessonBatch): FormGroup<ILessonForm> {
  //   const isGridOrigin = this.origin === 'grid';
  //   const form = this.fb.group(
  //     {
  //       id: [data?.id],
  //       schoolClass: this.fb.control({ value: data?.schoolClass, disabled: isGridOrigin }, [Validators.required]),
  //       teacher: this.fb.control({ value: data?.teacher, disabled: false }, [Validators.required]),
  //       curricularComponent: this.fb.control({ value: data?.curricularComponent, disabled: false }, [Validators.required]),
  //       school: this.fb.control({ value: data?.school, disabled: isGridOrigin }, [Validators.required]),
  //       date: this.fb.control({ value: data?.date, disabled: isGridOrigin }, [Validators.required]),
  //       endDate: this.fb.control({ value: data?.endDate, disabled: isGridOrigin }, [Validators.required]),
  //       frequencies: this.fb.array([]),
  //       description: this.fb.control({ value: data?.description, disabled: false }),
  //     },
  //     {
  //       validators: [
  //         FormValidators.dateRange('date', 'endDate')
  //       ]
  //     }
  //   );
  //
  //   (data?.frequencies || []).forEach(frequency => {
  //     this.addFrequency(frequency);
  //   })
  //
  //   return form as unknown as FormGroup<ILessonForm>;
  // }
  //
  // addFrequency(data?: Frequency) {
  //   if (this.origin == 'grid' && this.form.controls.frequencies.length > 0) {
  //     return;
  //   }
  //   const form = this.fb.group<ILessonFrequency>({
  //     id: this.fb.control(data?.id || 0),
  //     weekday: this.fb.control(data?.weekday || '', [Validators.required]),
  //     timeSchedule: this.fb.control(data?.timeSchedule || null, [Validators.required]),
  //     startHour: this.fb.control(data?.startHour || '', [Validators.required]),
  //     endHour: this.fb.control(data?.endHour || '', [Validators.required]),
  //   })
  //
  //   const { startHour, endHour } = form.controls;
  //   startHour.setValidators(FormValidators.rangeTimeCtrl(startHour, endHour))
  //   endHour.setValidators(FormValidators.rangeTimeCtrl(startHour, endHour))
  //
  //   const frequencies = this.form.controls.frequencies as any;
  //   frequencies.push(form);
  // }
  //
  // removeFrequency(index: number) {
  //   const frequencies = this.form.controls.frequencies as any;
  //   frequencies.removeAt(index);
  // }

  checkDates() {
    if (this.configs && !this.form.controls.date.value) {
      this.form.patchValue({
        date: this.configs.startFirstSemester,
        endDate: this.configs.endSecondSemester
      })
    }
  }

  async onSchoolChange(schoolId: number) {
    const id = schoolId || this.form.controls.school?.value.id || 0;
    if (id && id != this.schoolId) {
      await this.getConfigs(id);
      await this.getClasses(id);
    }
    this.checkDates();
  }

  formObservables() {
    const { school, schoolClass, teacher, curricularComponent } = this.form.controls;

    const checkLesson = Util.debounce(this.checkExistingLesson.bind(this), 400);

    schoolClass.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((classData) => {
        if (classData) {
          checkLesson();
          // const hasLesson = await this.checkExistingLesson();
          // if (hasLesson) return;
          // this.getTimeSchedule(classData).then();
        }
      })

    school?.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        startWith({ id: this.data.school?.id })
      )
      .subscribe(async (schoolData) => {
        checkLesson();
        // const hasLesson = await this.checkExistingLesson();
        // if (hasLesson) return;
        const id = schoolData?.id || 0;
        this.onSchoolChange(id).then();
      });

    // if (this.data.school?.id) {
    //   const id = this.data.school.id;
    //   this.getConfigs(id).then();
    //   this.getClasses(id).then();
    // }

    teacher?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(checkLesson);
    curricularComponent?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(checkLesson);
  }

  timeCheck = 0;

  async checkExistingLesson() {
    if (!this.lessonForm?.form) return;
    this.timeCheck = setTimeout(() => {

    })
    const form = this.lessonForm.form;
    const formValue = form.getRawValue() as unknown as LessonBatch;
    const { school, schoolClass, teacher, curricularComponent } = formValue;
    if (school?.id && schoolClass?.code && teacher?.id && curricularComponent?.id) {
      if (this.lessonKey === Util.lessonUK(formValue)) return;
      const params = {
        schoolId: school.id,
        classCode: schoolClass.code,
        curricularComponentId: curricularComponent.id,
        teacherId: teacher.id,
      };
      const lessons = await firstValueFrom(this.lessonsService.getAll(params));
      if (!lessons?.[0]) return;
      const lessonKey = Util.lessonUK(lessons[0]);
      this.lessonForm.patchValue(lessons[0] as any);
      this.lessonKey = lessonKey;
      return true;
    }
    else {
      this.lessonKey = '';
      this.form.controls.id.setValue(0);
      this.lessonForm.clearFrequencies();
    }
    return false;
  }

  transformHour(time: string | number | null | undefined) {
    const reg = new RegExp('([0-9]{2})$');
    const timeStr = String(time || '');
    let value = timeStr.replace(reg, ':$1');
    if(new RegExp('^[0-9]{1}:').test(value)) {
      value = '0' + value;
    }
    return value;
  }

  transformDate(date: string | number | null | undefined) {
    const reg = new RegExp('([0-9]{4}-[0-9]{2}-[0-9]{2})');
    const dateStr = String(date || '');
    const [, value] = reg.exec(dateStr) || [];
    return value;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
