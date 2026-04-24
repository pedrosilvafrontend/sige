import { ChangeDetectorRef, Component, effect, inject, input, OnDestroy, OnInit, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IProofForm, ProofForm } from '@form/proof.form';
import { Field } from '@ui/field/field';
import { CurricularComponent, LessonEvent, Proof, SchoolClass, User } from '@models';
import { TranslatePipe } from '@ngx-translate/core';
import { Textarea } from '@ui/field/textarea/textarea';
import { LessonEventService } from '@services/lesson-event.service';
import { JsonPipe } from '@angular/common';
import { EventCheckboxGroup } from '@ui/event-checkbox/event-checkbox-group/event-checkbox-group';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ProofTypes } from '@core/const/proof-type.data';
import { Subject, takeUntil } from 'rxjs';
import {
  CurricularComponentSelectComponent
} from '@modules/config/curricular-components-list/curricular-component-select/curricular-component-select.component';
import { ClassSelectComponent } from '@modules/classes/class-select/class-select.component';

@Component({
  selector: 'app-test-form',
  imports: [
    Field,
    ReactiveFormsModule,
    TranslatePipe,
    Textarea,
    JsonPipe,
    EventCheckboxGroup,
    MatFormFieldModule,
    MatSelectModule,
    CurricularComponentSelectComponent,
    ClassSelectComponent
  ],
  templateUrl: './test.form.html',
  styleUrl: './test.form.scss'
})
export class TestFormComponent implements OnInit, OnDestroy {
  private lessonEventService = inject(LessonEventService);
  private cdr = inject(ChangeDetectorRef);
  destroy$ = new Subject<void>();
  form: FormGroup<IProofForm> = this.createForm();
  classControl: FormControl<SchoolClass | null> = new FormControl<SchoolClass | null>(null);
  ccControl: FormControl<CurricularComponent | null> = new FormControl<CurricularComponent | null>(null);
  data = input<Partial<Proof>>({});
  dataId = input<number>();
  auth = input.required<User>();
  schoolId = input.required<number>();
  timeScheduleId = input.required<number>();
  date = input.required<string>();
  event = input<LessonEvent | undefined>();
  disabled = input(false);
  readOnly = input(false);
  form$ = output<FormGroup<IProofForm>>();
  events: LessonEvent[] = [];
  eventsLoading = signal(true);
  proofTypes = ProofTypes;
  // degreeId: string = '';
  // dayShiftId: string = '';
  classYearId: string = '';

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

      if (this.data()) {
        const data = this.data();
        this.form.patchValue(data);
        if (data.type === 'MULTICLASS_TEST') {
          this.changeType();
        }
      }

      this.form.controls.schoolId?.setValue(this.schoolId());

      const schoolClass = this.event()?.schoolClass;
      if (schoolClass) {
        // this.degreeId = schoolClass.degreeId || '';
        // this.dayShiftId = schoolClass.dayShiftId || '';
        this.classYearId = schoolClass.yearId || '';
      }
    })
  }

  timeChange = 0;
  changeType() {
    clearTimeout(this.timeChange);
    this.timeChange = setTimeout(() => this.changeMulti(), 1000)
  }
  changeMulti() {
    const multiclass = this.form.controls.type.value === 'MULTICLASS_TEST';
    if (multiclass) {
      const params = {
        schoolId: this.schoolId(),
        timeScheduleId: this.timeScheduleId(),
        date: (this.date() || '').substring(0, 10),
      }
      this.eventsLoading.set(true);
      this.lessonEventService.getAll(params).subscribe({
        next: (lessons) => {
          this.events = lessons || [];
          const eventWithMultiClass = this.events.find(
            (e) => e.evalTools.proof?.type === 'MULTICLASS_TEST');
          const multiclassTest = eventWithMultiClass?.evalTools.proof;
          if (multiclassTest && !this.form.controls.id.value) {
            this.form.patchValue(multiclassTest);
          }
          console.log('>>> lessons:', lessons);
          this.cdr.detectChanges();
        },
        complete: () => {
          this.eventsLoading.set(false);
        }
      });
      this.form.controls.score.removeValidators(Validators.required);
      this.form.controls.content.removeValidators(Validators.required);
    } else {
      this.form.controls.score.addValidators(Validators.required);
      this.form.controls.content.addValidators(Validators.required);
    }
    this.form.controls.score.updateValueAndValidity();
    this.form.controls.content.updateValueAndValidity();
    this.cdr.detectChanges();
  }

  createForm() {
    const form = ProofForm.form();
    const { type } = form.controls;
    type.valueChanges.pipe(takeUntil(this.destroy$)).subscribe({
      next: value => {
        this.changeType();
      }
    })
    return form;
  }

  ngOnInit() {
    this.form$.emit(this.form);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
