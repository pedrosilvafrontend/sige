import { ActivityConfig, School, SchoolClass, CurricularComponent } from '@models';

export interface ActivitiesCountFilters {
  school: Partial<School>;
  class: Partial<SchoolClass>;
  curricularComponent: Partial<CurricularComponent>;
  startDate: string | null;
  endDate: string | null;
  activityId: number | null;
  teacherId: number | null;
}

export interface ActivitiesCount {
  school: School;
  activity: ActivityConfig;
  class?: SchoolClass;
  curricularComponent?: CurricularComponent;
  count: number;
}

export interface ActivitiesCountResponse {
  data: ActivitiesCount[];
  schools: School[];
}
