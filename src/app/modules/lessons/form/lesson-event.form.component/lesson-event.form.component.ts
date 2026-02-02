import {
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
  Input,
  OnDestroy,
  OnInit,
  Output,
  signal,
  viewChild
} from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Util } from '@core/util/util';
import { DatePipe, NgClass, SlicePipe } from '@angular/common';
import { MatInput } from '@angular/material/input';
import { provideNgxMask } from 'ngx-mask';
import { User } from '@core/models/interface';
import { Activity } from '@modules/config/activity/activity.model';
import {
  LessonEvent,
  LessonEventForm,
  LessonEventFormValue,
  School,
  SchoolClass,
  TimeSchedule,
} from '@models';
import { Autocomplete } from '@util/autocomplete';
import { ProofForm } from '@form/proof.form';
import { MatSelectModule } from '@angular/material/select';
import { UserService } from '@modules/users/user.service';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { EvalTools } from '@models/eval-tools';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-lesson-events-form',
  standalone: true,
  imports: [
    FormsModule,
    MatFormField,
    MatLabel,
    ReactiveFormsModule,
    TranslateModule,
    MatInput,
    NgClass,
    MatSelectModule,
    DatePipe,
    SlicePipe,
    MatExpansionModule,
    MatTabsModule,
  ],
  providers: [
    provideNgxMask({})
  ],
  templateUrl: './lesson-event.form.component.html',
  styleUrl: './lesson-event.form.component.scss'
})
export class LessonEventFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  public form: FormGroup<LessonEventForm> = this.createForm();
  public classes: SchoolClass[] = [];
  public teachers: User[] = [];
  public schools: School[] = [];
  public activities: Activity[] = [];
  public objectCompare = Util.objectCompare;
  private sub = new Subject<void>();
  public schoolId = input(0);
  private _data: LessonEvent | undefined | null;
  private cdr = inject(ChangeDetectorRef);
  public autocomplete!: Autocomplete<Activity>;
  public disabled = input(false);
  public readOnly = input(false);
  public hasTest = false;
  public hasWork = false;
  public showProof = false;
  public user = this.userService.user;
  readonly proofPanelState = signal(false);
  public accordion = viewChild.required(MatAccordion);
  public params = {
    lessonId: 0,
    eventId: 0,
  }


  @Input()
  set data(data: LessonEvent | undefined | null) {
    this._data = data;
    if (data) {
      const dataForm = this.lessonEventToFormValue(data) as any;
      this.patchForm(dataForm);
      Object.assign(this.params, {
        lessonId: data.lesson.id,
      })
    }
  }
  get data(): LessonEvent {
    return this._data || {} as LessonEvent;
  }

  @Output()
  public form$ = new BehaviorSubject(this.form);

  constructor() {
    effect(() => {
      const disabled = this.disabled();
      const readOnly = this.readOnly();
      if (disabled || readOnly) {
        this.form.disable();
      } else {
        this.form.enable();
      }

      if (this.accordion()) {
        this.accordion().ngOnChanges = (changes => {
          console.log(changes)
        });
      }
      if (this.proofPanelState()) {
        console.log(this.proofPanelState())
      }

      this.checkProofForm();
    })
  }

  checkProofForm() {
    const formProof = this.form.get('evalTools.proof') as unknown as FormGroup<ProofForm>;
    if (formProof) {
      if (this.proofPanelState()) {
        formProof.enable({ emitEvent: false });
      }
      else {
        const hasValue = Object.values(formProof.value)
          .some(v => !!v && v !== '' && v !== null && v !== undefined);
        if (!hasValue) {
          formProof.disable({ emitEvent: false });
        }
      }
    }
  }

  patchForm(data: LessonEventFormValue) {
    this.form.patchValue(data);
    if (data.evalTools?.proof?.score) {
      this.showProof = true;
    }
  }

  lessonEventToFormValue(event: LessonEvent): LessonEventFormValue {
    const { title, date, frequency: { timeSchedule }, observations, evalTools, activities } = event || {};
    const masterAccess = ['admin', 'association'].includes(this.user.role || '');
    const managerAccess = ['principal', 'coordinator'].includes(this.user.role || '');
    const getTitle = () => {
      return [
        masterAccess ? event.school.acronym : '',
        event.schoolClass.code || '',
        event.curricularComponent.code+' '+event.curricularComponent.name,
        managerAccess ? event.lesson.teacher?.fullName : '',
      ].filter(v => !!v).join(' - ')
    }
    return {
      title: title || getTitle(),
      date: date || '',
      timeSchedule: timeSchedule as TimeSchedule,
      observations: observations || '',
      evalTools: evalTools || new class implements EvalTools {},
      activities
    }
  }

  async ngOnInit() {
    if (this.disabled() || this.readOnly()) {
      this.form.disable();
      return;
    }

    this.formObservables();
    this.cdr.detectChanges();
  }


  createForm(data?: LessonEvent): FormGroup<LessonEventForm> {
    const { title, date, frequency, observations, activities } = data || {};
    const { timeSchedule } = frequency || {};

    const extra = this.fb.group({
      id: this.fb.control(null),
      planning: this.fb.control(null)
    }, {disabled: true});

    const form = this.fb.group(
      {
        title: this.fb.control({value: title || '', disabled: true}),
        date: this.fb.control({value: date || '', disabled: true}),
        timeSchedule: this.fb.control({value: timeSchedule || null, disabled: true}),
        observations: this.fb.control(observations || ''),
        activities: this.fb.array([] as any),
        evalTools: this.fb.group({}),
        extra: extra
      }
    );

    return form;
  }

  formObservables() {
    const { activities } = this.form.controls;
    const checkActivities = (activities: Activity[]) => {
      const activityIds = (activities || []).map(a => a.id);
      this.hasTest = activityIds.includes('TEST');
      this.hasWork = activityIds.includes('WORK');
    }
    checkActivities(activities.value);
    activities.valueChanges.subscribe(checkActivities);
  }

  ngOnDestroy() {
    this.form$.complete();
    this.sub.complete();
  }

}
