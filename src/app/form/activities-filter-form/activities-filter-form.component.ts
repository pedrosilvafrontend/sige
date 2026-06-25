import { Component, effect, output, signal, untracked, ChangeDetectionStrategy } from '@angular/core';
import { MatCheckbox } from "@angular/material/checkbox";
import { TitleCasePipe } from "@angular/common";
import { TranslatePipe } from "@ngx-translate/core";
import { form } from '@angular/forms/signals';
import { ActivitiesFilter } from '@form/lesson-event-filter.form';

@Component({
  selector: 'app-activities-filter-form',
  imports: [
    MatCheckbox,
    TitleCasePipe,
    TranslatePipe,
  ],
  templateUrl: './activities-filter-form.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './activities-filter-form.component.scss',
})
export class ActivitiesFilterFormComponent {

  formChange = output<any>();

  readonly filtersModel = signal<ActivitiesFilter>({
    test: false,
    work: false,
    lesson: true,
  });

  readonly filtersForm = form(this.filtersModel);
  // readonly filtersDebounced = debounced(() => this.filtersModel(), 1000);

  constructor() {
    effect(() => {

      const currentTest = this.filtersModel().test;
      const currentWork = this.filtersModel().work;
      const currentLesson = this.filtersModel().lesson;
      const shouldBeLesson = !(currentTest || currentWork);

      untracked(() => {
        if (currentLesson !== shouldBeLesson) {
          this.filtersModel.update(current => ({
            ...current,
            lesson: shouldBeLesson
          }));
        }
      });

      this.formChange.emit(this.filtersModel());

    });
  }

  updateFilter(key: keyof ActivitiesFilter, isChecked: boolean) {
    this.filtersModel.update(current => {
      if (key === 'lesson' && isChecked) {
        return { test: false, work: false, lesson: true };
      }
      return {
        ...current,
        [key]: isChecked
      };
    });
  }

}
