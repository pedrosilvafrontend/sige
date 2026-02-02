import { Injectable } from '@angular/core';
import { BaseService } from '@services/base-service';
import { LessonEventExtra } from '@models';

@Injectable({
  providedIn: 'root'
})
export class LessonEventExtraService extends BaseService<LessonEventExtra> {
  constructor() {
    super('lessons/:lessonId/event-extra');
  }

  params(params: any) {
    this.urlParams = params;
    return this;
  }
}
