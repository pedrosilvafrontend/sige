import { Route } from '@angular/router';
import { LessonsComponent } from './lessons.component';
import { LessonEventsComponent } from './lesson-events/lesson-events.component';

export const CLASSES_LESSONS_ROUTE: Route[] = [
  {
    path: '',
    component: LessonsComponent,
  },
  {
    path: ':lessonId',
    component: LessonEventsComponent,
  },
];
