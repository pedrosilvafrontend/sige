import {
  LessonBatch,
  Activity,
  SchoolClass,
  CurricularComponent,
  Frequency,
  School,
  TimeSchedule,
  Proof, Work
} from '@models';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { EvalTools, EvalToolsForm } from '@models/eval-tools';

export interface SchoolEvent {
  id?: string;
  title: string;
  groupId: string;
  startDate: string;
  endDate: string;
  details: string;
  activities: Activity[];
  lesson?: Partial<LessonBatch>;
}

export type { SchoolEvent as LesEvent }

export interface LessonEventForm {
  title: FormControl<string | null>;
  date: FormControl<string | null>;
  timeSchedule: FormControl<TimeSchedule | null>;
  activities: FormArray;
  observations: FormControl<string | null>;
  evalTools: FormGroup<EvalToolsForm>;
  extra: FormGroup<LessonExtraForm>;
}

export interface LessonExtraForm {
  id: FormControl<number | null>;
  planning: FormControl<string | null>;
}

export interface LessonEventFormValue {
  title: string;
  date: string;
  timeSchedule: TimeSchedule;
  activities: Activity[];
  evalTools: EvalTools;
  observations: string;
}

export interface LessonEvent {
  title?: string;
  groupId?: string;
  activities: Activity[];
  evalTools: EvalTools;
  schoolClass: SchoolClass;
  curricularComponent: CurricularComponent;
  date: string;
  frequency: Frequency;
  lesson: LessonBatch;
  school: School;
  weekday: 'UNIQUE' | 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
  styleClass: string;
  start: string;
  end: string;
  test?: Proof,
  work?: Work,
  extra?: LessonEventExtra,
  observations: string;
}

export interface LessonEventExtra {
  id?: string;
  lessonId?: number;
  date?: string;
  timeScheduleId?: number;
  planning?: string;
}
