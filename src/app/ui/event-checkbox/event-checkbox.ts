import { Component, computed, effect, forwardRef, input, ChangeDetectionStrategy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LessonEvent, UniqueLessonEvent } from '@models';
import { MatCheckbox } from '@angular/material/checkbox';
import { Util } from '@util/util';

@Component({
  selector: 'app-event-checkbox',
  templateUrl: './event-checkbox.html',
  imports: [
    MatCheckbox
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EventCheckboxComponent),
      multi: true
    }
  ]
})
export class EventCheckboxComponent implements ControlValueAccessor {

  event = input.required<LessonEvent>();
  selected = input<boolean>(false);

  uniqueEvent = computed(() =>
    Util.toUniqueLessonEvent(this.event())
  );

  value: UniqueLessonEvent[] = [];
  checked = false;
  disabled = false;

  private onChange = (value: UniqueLessonEvent[]) => {};
  private onTouched = () => {};

  constructor() {
    effect(() => {
      console.log('>>>', this.selected(), this.event());
      this.toggle(this.selected());
    });
  }

  // 🔁 Recebe valor do form
  writeValue(value: UniqueLessonEvent[]): void {
    this.value = value || [];
    this.checked = this.isSelected(this.uniqueEvent());
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // ✅ Lógica de seleção
  toggle(checked: boolean) {
    this.checked = checked;

    let newValue = [...this.value];

    if (checked) {
      newValue.push(this.uniqueEvent());
    } else {
      newValue = newValue.filter(e => !this.compare(e, this.uniqueEvent()));
    }

    this.value = newValue;
    this.onChange(this.value);
    this.onTouched();
  }

  compare(a: UniqueLessonEvent, b: UniqueLessonEvent): boolean {
    return a.date === b.date
      && a.timeScheduleId === b.timeScheduleId
      && a.schoolId === b.schoolId
      && a.classId === b.classId
      && a.weekday === b.weekday;
  }

  isSelected(event: UniqueLessonEvent): boolean {
    return this.value?.some(e => this.compare(e, event));
  }
}

/*export class EventCheckboxComponent implements ControlValueAccessor {

  event = input.required<LessonEvent>();
  selected = input<boolean>(false);

  uniqueEvent = computed(() =>
    Util.toUniqueLessonEvent(this.event())
  );

  value: UniqueLessonEvent[] = [];
  checked = false;
  disabled = false;

  private onChange = (value: UniqueLessonEvent[]) => {};
  private onTouched = () => {};

  constructor() {
    effect(() => {
      console.log('>>>', this.selected(), this.event());
      this.toggle(this.selected());
    });
  }

  // 🔁 Recebe valor do form
  writeValue(value: UniqueLessonEvent[]): void {
    this.value = value || [];
    this.checked = this.isSelected(this.uniqueEvent());
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // ✅ Lógica de seleção
  toggle(checked: boolean) {
    this.checked = checked;

    let newValue = [...this.value];

    if (checked) {
      newValue.push(this.uniqueEvent());
    } else {
      newValue = newValue.filter(e => !this.compare(e, this.uniqueEvent()));
    }

    this.value = newValue;
    this.onChange(this.value);
    this.onTouched();
  }

  compare(a: UniqueLessonEvent, b: UniqueLessonEvent): boolean {
    return a.date === b.date
      && a.timeScheduleId === b.timeScheduleId
      && a.schoolId === b.schoolId
      && a.classId === b.classId
      && a.weekday === b.weekday;
  }

  isSelected(event: UniqueLessonEvent): boolean {
    return this.value?.some(e => this.compare(e, event));
  }
}*/

/*
export class EventCheckboxComponent implements ControlValueAccessor {

  event = input.required<LessonEvent>();
  selected = input<boolean>(false);

  uniqueEvent = computed(() =>
    Util.toUniqueLessonEvent(this.event())
  );

  emptyValue = (): UniqueLessonEvent => ({
    date: '',
    timeScheduleId: 0,
    schoolId: 0,
    classId: 0,
    frequencyId: 0,
    weekday: 'UNIQUE'
  });

  value: UniqueLessonEvent = this.emptyValue();
  checked = false;
  disabled = false;

  private onChange = (value: UniqueLessonEvent) => {};
  private onTouched = () => {};

  constructor() {
    this.toggle(this.selected());
  }

  // 🔁 Recebe valor do form
  writeValue(value: UniqueLessonEvent): void {
    this.value = value || this.emptyValue();
    this.checked = this.isSelected(this.uniqueEvent());
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // ✅ Lógica de seleção
  toggle(checked: boolean) {
    this.checked = checked;
    this.value = checked ? this.uniqueEvent() : this.emptyValue();
    this.onChange(this.value);
    this.onTouched();
  }

  compare(a: UniqueLessonEvent, b: UniqueLessonEvent): boolean {
    return a.date === b.date
      && a.timeScheduleId === b.timeScheduleId
      && a.schoolId === b.schoolId
      && a.classId === b.classId
      && a.weekday === b.weekday;
  }

  isSelected(event: UniqueLessonEvent): boolean {
    return !!this.value.schoolId;
    // return this.value?.some(e => this.compare(e, event));
  }
}
*/



