export interface ActivitiesFilter {
  test: boolean;
  work: boolean;
  lesson: boolean;
}

export interface EventFilter {
  activities: ActivitiesFilter;
  school: string | null;
  degreeId: string | null;
  schoolClass: string | null;
  teacher: string | null;
}
