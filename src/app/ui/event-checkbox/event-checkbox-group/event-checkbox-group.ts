import { ChangeDetectorRef, Component, effect, inject, input, signal, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { ActivityConfig, LessonEvent as LessonEvt, LessonEventForm, UniqueLessonEvent, User } from '@models';
import { MatCheckbox } from '@angular/material/checkbox';
import { EventCard } from '@ui/event-card/event-card';
import { AuthService } from '@services';
import { Skeleton } from '@ui/skeleton/skeleton';
import { Util } from '@util/util';

type LessonEvent = LessonEvt & { selected?: boolean, disabled?: boolean };

@Component({
  selector: 'app-event-checkbox-group',
  imports: [
    MatCheckbox,
    EventCard,
    Skeleton
  ],
  templateUrl: './event-checkbox-group.html',
  styleUrl: './event-checkbox-group.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  encapsulation: ViewEncapsulation.None
})
export class EventCheckboxGroup {
  private fb = new FormBuilder();
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);
  auth: User = this.authService.user$.value;
  events: LessonEvent[] = [];
  multiclass = input<boolean>(true);
  form = input.required<FormArray>();
  eventsInput = input.required<LessonEvent[]>({ alias: 'events' });
  disabled = input(false);
  isLoading = signal(true);

  activities: Map<string, ActivityConfig> = new Map<string, ActivityConfig>();

  constructor() {
    effect(() => {
      const hasMulticlassProof = this.eventsInput().some(
        event => event.evalTools.test?.id && event.evalTools.test?.type === 'MULTICLASS_TEST'
      );
      const eventKeys = new Set<string>();
      const getEventKey = (uEvent: UniqueLessonEvent) => {
        return `${uEvent.schoolId}|${uEvent.lessonId}|${uEvent.classId}|${uEvent.timeScheduleId}|${uEvent.weekday}`;
      };
      this.form().clear();
      const events: LessonEvent[] = this.eventsInput() || [];
      for (const event of events) {
        const uEvent = Util.toUniqueLessonEvent(event);
        this.form().push(this.getEventForm(uEvent));
      }
      if (!events.length && this.events.length > 0) {
        this.form().clear();
      }
      this.events = events;
      this.cdr.detectChanges();
      if (events.length) {
        this.isLoading.set(false);
      }
      else {
        setTimeout(() => {
          this.isLoading.set(false);
        }, 2000)
      }
    });
  }

  toggle(checked: boolean, index: number) {
    const event = this.eventsInput()[index];
    const uEvent = Util.toUniqueLessonEvent(event);
    uEvent.selected = checked;
    this.form().at(index).patchValue(uEvent);
  }

  // getEventForm(event: LessonEvent) {
  //   // return LessonEventForm(event);
  //   const fb = this.fb;
  //   const { title, date, frequency, observations, evalTools, extra, disabled, selected } = event || {};
  //   const { timeSchedule } = frequency || {};
  //   return fb.group(
  //     {
  //       title: fb.control({value: title || '', disabled: true}),
  //       date: fb.control({value: date || '', disabled: true}),
  //       timeSchedule: fb.control({value: timeSchedule || null, disabled: true}),
  //       observations: fb.control(observations || ''),
  //       evalTools: fb.control(evalTools || null),
  //       extra: fb.control(extra || null),
  //       disabled: fb.nonNullable.control({ value: !!disabled, disabled: false }),
  //       selected: fb.nonNullable.control({ value: !!selected, disabled: false })
  //     }
  //   );
  // }

  getEventForm(uEvent: UniqueLessonEvent) {
    const form = this.fb.nonNullable.group({
      date: [''],
      schoolId: [0],
      lessonId: [0],
      classId: [0],
      classCode: [''],
      frequencyId: [0],
      timeScheduleId: [0],
      weekday: ['UNIQUE'],
      proofId: [0],
      proofType: [''],
      workId: [0],
      selected: [false]
    });
    form.patchValue(uEvent, { emitEvent: false });
    return form;
  }
}
