import { Route } from '@angular/router';
import { TeachersComponent } from '@modules/teachers/teachers.component';

export const USERS_ROUTE: Route[] = [
  {
    path: '',
    redirectTo: 'teachers', pathMatch: 'full'
  },
  {
    path: 'teachers',
    component: TeachersComponent,
  },

];
