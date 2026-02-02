import { Route } from '@angular/router';
import {
  CurricularComponentsListComponent
} from '@modules/config/curricular-components-list/curricular-components-list.component';

export const CURRICULAR_COMPONENT_ROUTE: Route[] = [
  {
    path: '',
    component: CurricularComponentsListComponent,
  },

];
