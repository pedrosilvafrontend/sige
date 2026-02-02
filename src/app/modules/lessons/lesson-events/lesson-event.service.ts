import { Injectable } from '@angular/core';
import { BaseService } from '@services';

@Injectable({
  providedIn: 'root'
})
export class LesEventService extends BaseService {

  constructor() {
    super(`lessons/:lessonId/events`);
  }

  setParams(params: any) {
    this.urlParams = params;
  }
}
