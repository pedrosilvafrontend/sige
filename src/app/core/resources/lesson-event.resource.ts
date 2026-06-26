import { signal, Injector, inject, computed } from '@angular/core';
import { httpResource, HttpResourceRef } from '@angular/common/http';
import { environment } from '@env/environment';
import { LessonEvent } from '@models';

export interface EventsResourceParams {
  id: number;
  tipo: string;
}

export class EventResource {
  readonly API_URL = `${environment.baseUrl}/lesson-events`;
  readonly params = signal<Partial<EventsResourceParams>>({ id: 0, tipo: '' });
  readonly query: HttpResourceRef<any>;
  readonly events = computed(() => this.query.value());

  constructor(initialParams: Partial<EventsResourceParams>, injector: Injector) {
    this.params.set(initialParams);

    this.query = httpResource<LessonEvent[]>(() => {
      return {
        url: this.API_URL,
        params: this.params()
      }
    }, { injector });
  }

  update(params: Partial<EventsResourceParams>) {
    this.params.update(current => ({ ...current, ...params }));
  }
}

export function newEventResource(initialParams: Partial<EventsResourceParams>) {
  const injector = inject(Injector);
  return new EventResource(initialParams, injector);
}
