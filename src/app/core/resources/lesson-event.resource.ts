import { computed, inject, Injector, signal } from '@angular/core';
import { httpResource, HttpResourceRef } from '@angular/common/http';
import { environment } from '@env/environment';
import { LessonEvent } from '@models';

export interface EventsResourceParams {
  id?: number;
  tipo?: string;
  classHash?: string;
}

export class EventResource {
  readonly API_URL = `${environment.baseUrl}/lesson-events`;
  readonly params = signal<Partial<EventsResourceParams>>({ id: 0, tipo: '' });
  // readonly query: HttpResourceRef<any>;
  // readonly events = computed(() => this.query.value());

  get url() {
    const params = this.params();
    const classHash = params.classHash;
    console.log('>>> classHash', classHash);
    return classHash ? `${environment.baseUrl}/public/${classHash}/lesson-events` : `${environment.baseUrl}/lesson-events`;
  }

  constructor(initialParams: Partial<EventsResourceParams>, injector: Injector) {
    // if (this.auth.)
    // this.params.set(initialParams);
    // console.log('>>> this.auth', this.auth);

    // this.query = httpResource<LessonEvent[]>(() => {
    //   return {
    //     url: this.url,
    //     params: this.params()
    //   }
    // }, { injector });
  }

  // getEvents() {
  //   const params = this.params();
  //   const classHash = params.classHash;
  //   console.log('>>> classHash', classHash);
  //
  //   this.query = httpResource<LessonEvent[]>(() => {
  //     const url = classHash ? `${environment.baseUrl}/public/${classHash}/lesson-events` : `${environment.baseUrl}/lesson-events`;
  //     return {
  //       url,
  //       params: this.params()
  //     }
  //   }, { injector: this.injector });
  // }

  update(params: Partial<EventsResourceParams>) {
    this.params.update(current => ({ ...current, ...params }));
  }
}

export function newEventResource(initialParams: Partial<EventsResourceParams>) {
  const injector = inject(Injector);
  return new EventResource(initialParams, injector);
}

export function eventResourceFactory() {
  const injector = inject(Injector);
  return (initialParams?: Partial<EventsResourceParams>) => new EventResource(initialParams || {}, injector);
}
