import {
  LessonBatch,
  ActivityConfig,
  SchoolClass,
  CurricularComponent,
  Frequency,
  School,
  TimeSchedule,
  Proof, Work, Entity, User
} from '@models';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { EvalTools, EvalToolsForm } from '@models/eval-tools';

export type Weekday = 'UNIQUE' | 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export interface SchoolEvent {
  id?: string;
  title: string;
  groupId: string;
  startDate: string;
  endDate: string;
  details: string;
  activities: ActivityConfig[];
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
  activities: ActivityConfig[];
  evalTools: EvalTools;
  observations: string;
}

export interface LessonEvent {
  title?: string;
  groupId?: string;
  activities: ActivityConfig[];
  evalTools: EvalTools;
  schoolClass: SchoolClass;
  curricularComponent: CurricularComponent;
  date: string;
  frequency: Frequency;
  lesson: LessonBatch;
  school: School;
  weekday: Weekday;
  styleClass: string;
  start: string;
  end: string;
  extra?: LessonEventExtra;
  color?: string;
  observations: string;
  countActivities: CountActivities;
}

export class LessonEvent {
  title?: string;
  groupId?: string;
  activities: ActivityConfig[] = [];
  evalTools!: EvalTools;
  schoolClass: SchoolClass;
  curricularComponent: CurricularComponent;
  date: string;
  frequency!: Frequency;
  lesson!: LessonBatch;
  school: School;
  weekday!: Weekday;
  styleClass!: string;
  start: string = '';
  end: string = '';
  extra?: LessonEventExtra;
  color?: string;
  observations: string = '';
  countActivities!: CountActivities;

  constructor(lesson: Partial<LessonEvent> = {}) {
    {
      this.title = lesson.title || '';
      this.groupId = lesson.groupId || '';
      this.activities = lesson.activities || [];
      this.evalTools = lesson.evalTools || new EvalTools();
      this.schoolClass = lesson.schoolClass || new SchoolClass();
      this.curricularComponent = lesson.curricularComponent || new CurricularComponent();
      this.date = lesson.date || '';
      this.frequency = lesson.frequency || new Frequency();
      this.lesson = lesson.lesson || new LessonBatch();
      this.school = lesson.school || new School();
      this.weekday = lesson.weekday || 'UNIQUE';
      this.styleClass = lesson.styleClass || '';
      this.start = lesson.start || '';
      this.end = lesson.end || '';
      this.extra = lesson.extra || undefined;
      this.color = lesson.color || '';
      this.observations = lesson.observations || '';
      this.countActivities = <CountActivities>lesson.countActivities || undefined;
    }
  }
}

export interface CountActivities {
  proofs: number;
  maxProofs: number;
  works: number;
  maxWorks: number;
  total: number;
  maxTotal: number;
}

export interface LessonEventExtra {
  id?: string;
  lessonId?: number;
  date?: string;
  timeScheduleId?: number;
  planning?: string;
}

export interface UniqueLessonEvent {
  date: string,
  schoolId: number,
  classId: number,
  frequencyId: number,
  timeScheduleId: number,
  weekday: Weekday,
  selected?: boolean
}
