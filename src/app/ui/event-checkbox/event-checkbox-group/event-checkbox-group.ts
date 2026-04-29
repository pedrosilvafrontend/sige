import { ChangeDetectorRef, Component, effect, inject, input, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl } from '@angular/forms';
import { ActivityConfig, LessonEvent as LessonEvt, UniqueLessonEvent, User } from '@models';
import { EventCheckboxComponent } from '@ui/event-checkbox/event-checkbox';
import { FormPipe } from '@util/form-pipe';
import { Util } from '@util/util';
import { MatCheckbox } from '@angular/material/checkbox';
import { EventCard } from '@ui/event-card/event-card';
import { AuthService } from '@services';
import { Activity } from '@modules/config/activity/activity.model';

type LessonEvent = LessonEvt & { selected?: boolean, disabled?: boolean };

@Component({
  selector: 'app-event-checkbox-group',
  imports: [
    EventCheckboxComponent,
    FormPipe,
    MatCheckbox,
    EventCard
  ],
  templateUrl: './event-checkbox-group.html',
  styleUrl: './event-checkbox-group.scss',
  encapsulation: ViewEncapsulation.None
})
export class EventCheckboxGroup {
  private fb = new FormBuilder();
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);
  auth: User = this.authService.user$.value;
  events: LessonEvent[] = [];
  form = input.required<FormArray>();
  eventsInput = input.required<LessonEvent[]>({ alias: 'events' });
  disabled = input(false);
  selectAll = input(false);
  // selectedClasses = input<number[]>([]);

  activities: Map<string, ActivityConfig> = new Map<string, ActivityConfig>();

  constructor() {
    effect(() => {
      const hasMulticlassProof = this.eventsInput().some(
        event => event.evalTools.proof?.id && event.evalTools.proof?.type === 'MULTICLASS_TEST'
      );
      const selectAll = !hasMulticlassProof && this.selectAll();
      // const classesIds = this.selectedClasses();
      const eventKeys = new Set<string>();
      const getEventKey = (uEvent: UniqueLessonEvent) => {
        return `${uEvent.schoolId}|${uEvent.lessonId}|${uEvent.classId}|${uEvent.timeScheduleId}|${uEvent.weekday}`;
      };
      this.form().clear();
      const events: LessonEvent[] = [];
      for (const event of this.eventsInput()) {
        const uEvent = Util.toUniqueLessonEvent(event);
        const eventKey = getEventKey(uEvent);
        if (eventKeys.has(eventKey)) {
          continue;
        }
        eventKeys.add(eventKey);

        // let selected = false;
        // if (classesIds.length) {
        //   selected = classesIds.includes(event.schoolClass?.id ?? -1);
        // }
        // if (event.evalTools.proof?.id && event.evalTools.proof?.type === 'MULTICLASS_TEST') {
        //   selected = true;
        // }
        // else {
        //   selected = selectAll;
        // }
        // uEvent.selected = selected;
        // event.selected = selected;

        // uEvent.selected = event.selected || selectAll;
        // if (!event.selected) {
        //   event.selected = selectAll;
        // }
        events.push(event);
        this.form().push(this.getEventForm(uEvent))
      }
      if (!events.length && this.events.length > 0) {
        this.form().clear();
      }
      this.events = events;
      this.cdr.detectChanges();
    });
  }

  toggle(checked: boolean, index: number) {
    const event = this.eventsInput()[index];
    const uEvent = Util.toUniqueLessonEvent(event);
    uEvent.selected = checked;
    this.form().at(index).patchValue(uEvent);
  }

  getEventForm(uEvent: UniqueLessonEvent) {
    const form = this.fb.nonNullable.group({
      date: [''],
      schoolId: [0],
      lessonId: [0],
      classId: [0],
      frequencyId: [0],
      timeScheduleId: [0],
      weekday: ['UNIQUE'],
      selected: [false]
    });
    form.patchValue(uEvent, { emitEvent: false });
    return form;
  }
}
