import {
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IProofForm, ProofForm } from '@form/proof.form';
import { Field } from '@ui/field/field';
import { CurricularComponent, LessonEvent, Test, SchoolClass, UniqueLessonEvent, User } from '@models';
import { TranslatePipe } from '@ngx-translate/core';
import { Textarea } from '@ui/field/textarea/textarea';
import { LessonEventService } from '@services/lesson-event.service';
import { EventCheckboxGroup } from '@ui/event-checkbox/event-checkbox-group/event-checkbox-group';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TestTypes } from '@core/const/proof-type.data';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import {
  CurricularComponentSelectComponent
} from '@modules/config/curricular-components-list/curricular-component-select/curricular-component-select.component';
import { FormUtil } from '@util/form-util';
import { AuthService } from '@services';
import { ProofService } from '@core/services/proof.service';
import { Util } from '@util/util';

@Component({
  selector: 'app-test-form',
  imports: [
    Field,
    ReactiveFormsModule,
    TranslatePipe,
    Textarea,
    EventCheckboxGroup,
    MatFormFieldModule,
    MatSelectModule,
    CurricularComponentSelectComponent,
  ],
  templateUrl: './test.form.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './test.form.scss'
})
export class TestFormComponent implements OnInit, OnDestroy {
  private lessonEventService = inject(LessonEventService);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);
  private proofService = inject(ProofService);

  auth = this.authService.user$.value;
  destroy$ = new Subject<void>();
  form: FormGroup<IProofForm> = this.createForm();
  classControl: FormControl<SchoolClass | null> = new FormControl<SchoolClass | null>(null);
  ccControl = this.form.controls.curricularComponent;
  test = input<Partial<Test>>({});
  classHash = input<string>('');
  schoolId = input.required<number>();
  timeScheduleId = input.required<number>();
  override = input<Partial<Test> | null>();
  // dateInput = input.required<string>({ alias: 'date' });
  showEventCards = input<boolean>(true);
  initialSelectedEvents = output<UniqueLessonEvent[]>();
  date!: string;
  proof!: Test;
  testId = 0;
  eventInput = input<LessonEvent>(undefined, {alias: 'event'});
  disabled = input(false);
  readOnly = input(false);
  form$ = output<FormGroup<IProofForm>>();
  events: LessonEvent[] = [];
  eventsLoading = signal(true);
  proofTypes = TestTypes;
  isMulticlassRef = false;
  isMulticlass = false;
  // degreeId: string = '';
  // dayShiftId: string = '';
  classYearId: string = '';
  compare = FormUtil.compare;
  private _event!: LessonEvent;
  get event(): LessonEvent {
    return this._event;
  }
  set event(value: LessonEvent) {
    this._event = value;
  }

  get isManager() {
    return ['admin', 'coordinator', 'principal'].includes(this.auth.role || '');
  }

  constructor() {
    effect(() => {
      const disabled = this.disabled();
      const readOnly = this.readOnly();
      if (disabled || readOnly) {
        this.form.disable();
      } else {
        this.form.enable();
      }
      this.cdr.detectChanges();

      let date = this.eventInput()?.date || '';
      if (typeof date !== 'string') {
        if ((date as Date).toISOString) {
          date = (date as Date).toISOString();
        }
      }
      this.date = date;

      // if (this.test() && !this.testId) {
      //   const data = this.test();
      //   this.form.patchValue(data);
      //   if (data.type === 'MULTICLASS_TEST') {
      //     this.changeType();
      //   }
      //   // const eventInput = this.eventInput();
      //   // const { start, end, lesson, date, weekday, school } = eventInput || {};
      //   // this.setEvent(new LessonEvent({ start, end, lesson, date, weekday, school }));
      // }
      // else {
      // }

      this.isMulticlassRef = this.test()?.lessonId ? this.test()?.lessonId === this.eventInput()?.lesson.id : false;

      this.form.controls.schoolId?.setValue(this.schoolId());

    })

    effect(() => {
      const event = this.eventInput();
      if (event) {
        this.setEvent(event);
      }

      if (this.classHash()) {
        const testId = this.test()?.id || 0;
        this.getTest(testId, this.classHash() || '').then();
      }
      else {
        if (this.override()) {
          const id = event?.evalTools?.proof?.id || 0;
          const { title, score, content, whereToFindIt } = this.override() || {};
          this.pathValue({ id, title, score, content, whereToFindIt }, true);
        } else if (event?.evalTools?.proof?.id) {
          this.pathValue(event?.evalTools?.proof || {}, true);
        } else if (this.test()) {
          this.pathValue(this.test());
        } else {
          this.pathValue(new Test());
        }
      }
    });
  }

  pathValue(test: Partial<Test>, forceId?: boolean) {
    const { title, score, content, whereToFindIt } = test;
    const data: Partial<Test> = {
      title: title || '',
      score: score || '',
      content: content || '',
      whereToFindIt: whereToFindIt || ''
    };
    if (forceId) {
      data.id = test.id || 0;
    }
    this.form.patchValue(data);
  }

  async getTest(testId: number, classHash?: string) {
    if (!testId) {
      return;
    }

    if (testId) {
      const request$ = classHash
        ? this.proofService.getByHash(classHash || '', testId)
        : this.proofService.getById(testId);
      const test = await firstValueFrom(request$);
      if (test) {
        this.form.patchValue(test);
        const cc = test.curricularComponent || new CurricularComponent({ id: test.curricularComponentId });
        this.ccControl.setValue(cc);
      }
      this.proof = test;
    }
    else {
      const event = this.eventInput();
      if (event) {
        this.setEvent(event);
      }
    }
  }

  setEvent(event: LessonEvent) {
    if (!event) {
      return;
    }
    this._event = event;
    if (!this.proof?.curricularComponentId) {
      this.ccControl.setValue(event.curricularComponent);
    }

    this.form.controls.lessonId?.setValue(event.lesson.id || 0);
  }

  timeChange = 0;
  changeType() {
    clearTimeout(this.timeChange);
    this.timeChange = setTimeout(() => this.changeMulti(), 1000)
  }
  async changeMulti() {
    const { score, content, events, type } = this.form.controls;
    const multiclass = this.form.controls.type.value === 'MULTICLASS_TEST';
    if (multiclass) {
      const params = {
        schoolId: this.schoolId(),
        timeScheduleId: this.timeScheduleId(),
        date: (this.date || '').substring(0, 10),
        classHash: this.classHash() || '',
      }
      this.eventsLoading.set(true);

      let lessons: LessonEvent[] = [];
      if (this.isManager && this.schoolId() && this.showEventCards() && !this.classHash()) {
        lessons = await firstValueFrom(this.lessonEventService.getAll(params));
      }

      const initialSelecteds: UniqueLessonEvent[] = [];
      this.events = (lessons || []).map(l => {
        const type = l.evalTools.proof?.type;
        const isMulti = type === 'MULTICLASS_TEST';
        const disabled = type && !isMulti;
        const isCreate = !this.form.controls.id.value;
        const selected = isCreate ? !disabled : isMulti && !disabled;
        const data: any = {
          ...l,
          disabled,
          selected
        }
        if (selected) {
          initialSelecteds.push(Util.toUniqueLessonEvent(data));
        }
        return data;
      });

      this.initialSelectedEvents.emit(initialSelecteds);

      const eventWithMultiClass = this.events.find(
        (e) => e.evalTools.proof?.type === 'MULTICLASS_TEST');
      const multiclassTest = eventWithMultiClass?.evalTools.proof;
      if (multiclassTest?.id && !this.form.controls.id.value) {
        await this.getTest(multiclassTest.id);
      }
      const multiclassEventRef = this.events.find(
        e => {
          return e.evalTools.proof?.type === 'MULTICLASS_TEST' && e.evalTools.proof?.lessonId === e.lesson.id
        });
      const currentEvent = this.events.find(
        e => e.lesson.id === this.eventInput()?.lesson.id);
      this.isMulticlass = currentEvent?.evalTools?.proof?.type === 'MULTICLASS_TEST';
      const classRef = multiclassEventRef?.schoolClass || this.events[0]?.schoolClass;
      const classYearId = classRef?.yearId;
      if (classYearId) {
        this.classYearId = classYearId;
        if (!this.proof?.curricularComponentId) {
          this.ccControl.setValue(null)
        }
      }
      this.eventsLoading.set(false);
      this.cdr.detectChanges();

      // this.lessonEventService.getAll(params).subscribe({
      //   next: (lessons) => {
      //   },
      //   complete: () => {
      //     this.eventsLoading.set(false);
      //   }
      // });
      score.clearValidators();
      content.clearValidators();
    } else {
      if (this.events.length > 0) {
        this.events.length = 0;
        events.clear();
        const event = this.eventInput();
        if (event) {
          this.setEvent(event);
        }
      }

      const hasRequiredValidator = (control: AbstractControl) => control.validator?.({ value: '' } as any)?.['required'];
      if (!hasRequiredValidator(score)) {
        score.addValidators(Validators.required);
      }
      if (!hasRequiredValidator(content)) {
        content.addValidators(Validators.required);
      }
    }

    if (!this.isManager) {
      this.ccControl.disable({ emitEvent: false });
      // type.disable({ emitEvent: false });
    }

    score.updateValueAndValidity();
    content.updateValueAndValidity();
    this.cdr.detectChanges();
  }

  createForm() {
    const form = ProofForm.form();
    form.controls.events.clearValidators();
    const { type } = form.controls;
    type.valueChanges.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.changeType();
      }
    })
    return form;
  }

  async ngOnInit() {
    this.form$.emit(this.form);

    this.ccControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe({
      next: (cc) => {
        this.form.controls.curricularComponentId.setValue(cc?.id || 0, { emitEvent: false })
      }
    })

    if (this.testId) {
      await this.getTest(this.testId || 0, this.classHash() || '');

      if (this.proof?.type === 'MULTICLASS_TEST') {
        this.changeType();
      }
    }
    else {
      const cc = this.eventInput()?.curricularComponent;
      if (cc) {
        this.ccControl.setValue(cc)
      }
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
