import {
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
  model,
  OnDestroy,
  OnInit,
  output,
  signal
} from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IProofForm, ProofForm } from '@form/proof.form';
import { Field } from '@ui/field/field';
import { CurricularComponent, LessonEvent, Proof, SchoolClass, UniqueLessonEvent, User } from '@models';
import { TranslatePipe } from '@ngx-translate/core';
import { Textarea } from '@ui/field/textarea/textarea';
import { LessonEventService } from '@services/lesson-event.service';
import { EventCheckboxGroup } from '@ui/event-checkbox/event-checkbox-group/event-checkbox-group';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ProofTypes } from '@core/const/proof-type.data';
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
    CurricularComponentSelectComponent
  ],
  templateUrl: './test.form.html',
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
  data = input<Partial<Proof>>({});
  testId = input<number>();
  schoolId = input.required<number>();
  timeScheduleId = input.required<number>();
  dateInput = input.required<string>({ alias: 'date' });
  initialSelectedEvents = output<UniqueLessonEvent[]>();
  date!: string;
  proof!: Proof;
  // date = input.required<string>({
  //   transform: v => {
  //     const type = typeof v;
  //     if (type === 'object' && v.toISOString) {
  //       return v.toISOString();
  //     }
  //     if (type !== 'string') {
  //       return '';
  //     }
  //     return v;
  //   }
  // } as any);
  eventInput = input.required<LessonEvent>({alias: 'event'});
  disabled = input(false);
  readOnly = input(false);
  form$ = output<FormGroup<IProofForm>>();
  events: LessonEvent[] = [];
  eventsLoading = signal(true);
  proofTypes = ProofTypes;
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

      let date = this.dateInput();
      if (typeof date !== 'string') {
        if ((date as Date).toISOString) {
          date = (date as Date).toISOString();
        }
      }
      this.date = date;

      // if (this.data()) {
      //   const data = this.data();
      //   this.form.patchValue(data);
      //   if (data.type === 'MULTICLASS_TEST') {
      //     this.changeType();
      //   }
      //   // const eventInput = this.eventInput();
      //   // const { start, end, lesson, date, weekday, school } = eventInput || {};
      //   // this.setEvent(new LessonEvent({ start, end, lesson, date, weekday, school }));
      // }
      // else {
      //   this.setEvent(this.eventInput());
      // }

      this.isMulticlassRef = this.data()?.lessonId ? this.data()?.lessonId === this.eventInput()?.lesson.id : false;

      this.form.controls.schoolId?.setValue(this.schoolId());

    })
  }

  async getProof(proofId: number) {
    if (proofId) {
      const proof = await firstValueFrom(this.proofService.getById(proofId));
      if (proof) {
        // const currentLessonId = this.eventInput()?.lesson?.id || 0;
        // const data = proof;
        // if (currentLessonId && currentLessonId !== proof.lessonId) {
        //   data.id = 0;
        // }
        // this.form.patchValue({ type: data.type }, { emitEvent: false });
        this.form.patchValue(proof);
        const cc = proof.curricularComponent || new CurricularComponent({ id: proof.curricularComponentId });
        this.ccControl.setValue(cc);
      }
      this.proof = proof;
      // const eventInput = this.eventInput();
      // const { start, end, lesson, date, weekday, school } = eventInput || {};
      // this.setEvent(new LessonEvent({ start, end, lesson, date, weekday, school }));
    }
    else {
      this.setEvent(this.eventInput());
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

  // onChangeCc() {
  //   const cc = this.ccControl.value;
  //   if (!cc) {
  //     this.setEvent(this.eventInput());
  //     return;
  //   }
  // }

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
      }
      this.eventsLoading.set(true);

      const lessons = await firstValueFrom(this.lessonEventService.getAll(params));

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
        await this.getProof(multiclassTest.id);
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
        this.setEvent(this.eventInput());
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

    if (this.testId()) {
      await this.getProof(this.testId() || 0);

      if (this.proof?.type === 'MULTICLASS_TEST') {
        this.changeType();
      }
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
