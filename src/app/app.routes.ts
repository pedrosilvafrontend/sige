import { Routes } from '@angular/router';
import { MainComponent } from './core/layout/main/main.component';
import { AuthGuard } from './core/guard';
import { Page403Component } from './modules/sessions/page403/page403.component';
import { Page404Component } from './modules/sessions/page404/page404.component';
import { Page500Component } from './modules/sessions/page500/page500.component';
import { Public } from './core/layout/public/public';
import { CalendarComponent } from './modules/calendar/calendar.component';

export const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: '/login', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./modules/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTE),
      },
      {
        path: 'schools',
        loadChildren: () =>
          import('./modules/schools/schools.routes').then(
            (m) => m.SCHOOLS_ROUTE
          ),
      },
      {
        path: 'classes',
        loadChildren: () =>
          import('./modules/classes/classes.routes').then(
            (m) => m.CLASSES_ROUTE
          ),
      },
      {
        path: 'lessons',
        loadChildren: () =>
          import('./modules/lessons/lessons.routes').then(
            (m) => m.CLASSES_LESSONS_ROUTE
          ),
      },
      {
        path: 'teachers',
        loadChildren: () =>
          import('./modules/teachers/teachers.routes').then(
            (m) => m.TEACHERS_ROUTE
          ),
      },
      {
        path: 'managers',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./modules/managers/managers.routes').then(
            (m) => m.MANAGERS_ROUTE
          ),
      },
      {
        path: 'proofs',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./modules/proofs/proofs.routes').then(
            (m) => m.PROOFS_ROUTE
          ),
      },
      {
        path: 'users',
        loadChildren: () =>
          import('./modules/users/users.routes').then(
            (m) => m.USERS_ROUTE
          ),
      },
      {
        path: 'calendar',
        loadChildren: () =>
          import('./modules/calendar/calendar.routes').then(
            (m) => m.CALENDAR_ROUTE
          ),
      },
      {
        path: 'configs/curricular-components-list',
        loadChildren: () =>
          import('./modules/config/curricular-components-list/curricular-components-list.routes').then(
            (m) => m.CURRICULAR_COMPONENT_ROUTE
          ),
      },
      {
        path: 'configs/day-shifts',
        loadChildren: () =>
          import('./modules/config/day-shifts/day-shifts.routes').then(
            (m) => m.DAY_SHIFTS_ROUTE
          ),
      },
      {
        path: 'configs/general',
        loadChildren: () =>
          import('./modules/config/config/config.routes').then(
            (m) => m.CONFIG_ROUTE
          ),
      },
      {
        path: '403',
        component: Page403Component,
      },
      {
        path: '404',
        component: Page404Component,
      },
      {
        path: '500',
        component: Page500Component,
      },
    ]
  },
  {
    path: '',
    component: Public,
    loadChildren: () =>
      import('./modules/sessions/sessions.routes').then((m) => m.SESSION_ROUTE),
  },
  {
    path: 'public/calendar/:classHash',
    component: CalendarComponent
  },
  { path: '**', redirectTo: '404' },
];
