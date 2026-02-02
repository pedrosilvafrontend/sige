import { Route } from '@angular/router';
import { Page404Component } from '../sessions/page404/page404.component';
import { DashboardComponent } from '@modules/dashboard/dashboard.component';

export const DASHBOARD_ROUTE: Route[] = [
  {
    path: '',
    component: DashboardComponent
  },
  { path: '**', component: Page404Component },
];
