
export interface ConfigModel {
  id?: number;
  key: string;
  value: string;
  schoolId: number;
  associationId: number;
}


export interface ConfigData {
  id?: number;
  schoolId?: number;
  associationId?: number;
  startFirstSemester: string;
  endFirstSemester: string;
  startSecondSemester: string;
  endSecondSemester: string;
  maxDayTests: number;
  maxDayWorks: number;
  maxDayActivities: number;
  updateLessons: boolean;
}

export interface ConfigResponse {
  school: ConfigData;
  association: ConfigData;
}
