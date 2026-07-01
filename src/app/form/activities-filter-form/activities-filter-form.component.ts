import {
  Component,
  effect,
  output,
  signal,
  untracked,
  ChangeDetectionStrategy,
  debounced,
  WritableSignal, input
} from '@angular/core';
import { MatCheckbox } from "@angular/material/checkbox";
import { TitleCasePipe } from "@angular/common";
import { TranslatePipe } from "@ngx-translate/core";
import { FieldTree, form } from '@angular/forms/signals';
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

  readonly filtersModel = signal<ActivitiesFilter>({
    test: false,
    work: false,
    lesson: true,
  });
  data = input<Partial<ActivitiesFilter>>();
  change = output<ActivitiesFilter>();
  model = output<WritableSignal<ActivitiesFilter>>();
  form$ = output<FieldTree<ActivitiesFilter>>({ alias: 'form' })

  readonly filtersForm = form(this.filtersModel);
  readonly filtersDebounced = debounced(() => this.filtersModel(), 500);

  constructor() {
    this.form$.emit(this.filtersForm);
    this.model.emit(this.filtersModel);
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

    });

    effect(() => {
      const stabilizedFilters = this.filtersDebounced.value();
      if (stabilizedFilters) {
        this.change.emit(stabilizedFilters);
      }
    });

    effect(() => {
      if (this.data()) {
        this.filtersModel.update((curr) => ({
          ...curr,
          ...this.data()
        }))
      }
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
