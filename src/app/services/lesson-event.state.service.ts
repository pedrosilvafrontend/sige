import { computed, Injectable, signal } from '@angular/core';
import { LessonEvent } from '@models';
import { httpResource } from '@angular/common/http';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class LessonEventStateService {
  readonly API_URL = `${environment.baseUrl}/lesson-events`;

  private getAllParams = signal<any>({});
  private lessonEventsResource = httpResource<LessonEvent[]>(() => {
    return {
      url: `${this.API_URL}`,
      params: this.getAllParams()
    }
  });
  readonly lessonEvents = computed(() => this.lessonEventsResource.value());
  readonly lessonEventsLoading = computed(() => this.lessonEventsResource.isLoading());
  readonly lessonEventsErro = computed(() => this.lessonEventsResource.error());
  readonly lessonEventsStatus = computed(() => this.lessonEventsResource.status());

  getBy(params: any) {
    this.getAllParams.set(params || {});
  }

}
