import { School } from '@models/school.model';
import { SchoolClass } from '@models/classes.model';
import { CurricularComponent } from '@models/curricular-component.model';

export interface Activity {
  id: string;
  name: string;
  color?: string;
}

export interface CountActivitiesResponse {
  tests: number;
  works: number;
  school: School;
  class: SchoolClass;
  curricularComponent: CurricularComponent;
}
