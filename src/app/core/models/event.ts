import {
  LessonBatch,
  ActivityConfig,
  SchoolClass,
  CurricularComponent,
  Frequency,
  School,
  TimeSchedule,
  Test, Work, Entity, User
} from '@models';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { EvalTools, EvalToolsForm } from '@models/eval-tools';
import { ProofForm } from '@form/proof.form';
import { WorkForm } from '@form/work.form';

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
  disabled: FormControl<boolean>;
  selected: FormControl<boolean>;
}

export function LessonEventForm(data?: LessonEvent): FormGroup<LessonEventForm> {
  const fb = new FormBuilder()
  const { title, date, frequency, observations, evalTools, extra, disabled, selected } = data || {};
  const { timeSchedule } = frequency || {};

  const extraForm = fb.group({
    id: fb.control({ value: extra?.id || '', disabled: true }),
    planning: fb.control({ value: extra?.planning || '', disabled: true })
  });

  const evalToolsForm = fb.group<EvalToolsForm>({
    proof: ProofForm.form(evalTools?.test),
    work: WorkForm.form(evalTools?.work),
  });

  const form = fb.group(
    {
      title: fb.control({value: title || '', disabled: true}),
      date: fb.control({value: date || '', disabled: true}),
      timeSchedule: fb.control({value: timeSchedule || null, disabled: true}),
      observations: fb.control(observations || ''),
      activities: fb.array([] as any),
      evalTools: evalToolsForm,
      extra: extraForm,
      disabled: fb.nonNullable.control({ value: !!disabled, disabled: false }),
      selected: fb.nonNullable.control({ value: !!selected, disabled: false })
    }
  );

  return form;
}

export interface LessonExtraForm {
  id: FormControl<string | null>;
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

export type EventMerge = Partial<LessonEvent & LiteEvent>;

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
  countActivities?: CountActivities;
  disabled?: boolean;
  selected?: boolean;
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
  countActivities?: CountActivities;

  constructor(event: Partial<LessonEvent> = {}) {
    this.title = event.title || '';
    this.groupId = event.groupId || '';
    this.activities = event.activities || [];
    this.evalTools = event.evalTools || new EvalTools();
    this.schoolClass = event.schoolClass || new SchoolClass();
    this.curricularComponent = event.curricularComponent || new CurricularComponent();
    this.date = event.date || '';
    this.frequency = event.frequency || new Frequency();
    this.lesson = event.lesson || new LessonBatch();
    this.school = event.school || new School();
    this.weekday = event.weekday || 'UNIQUE';
    this.styleClass = event.styleClass || '';
    this.start = event.start || '';
    this.end = event.end || '';
    this.extra = event.extra || undefined;
    this.color = event.color || '';
    this.observations = event.observations || '';
    this.countActivities = <CountActivities>event.countActivities || undefined;
  }
}

export class LiteEvent {
  date: string;
  weekday!: Weekday;
  startTime: string = '';
  endTime: string = '';
  schoolId: number = 0;
  schoolAcronym: string = '';
  lessonId: number = 0;
  classId: number = 0;
  classCode: string = '';
  timeScheduleId: number = 0;
  degreeId: number = 0;
  curricularComponentId: number = 0;
  curricularComponentName: string = '';
  teacherId: number = 0;
  teacherName: string = '';
  testId: number = 0;
  testType: string = '';
  testStatus: string = '';
  workId: number = 0;
  workStatus: string = '';
  color: string = '';
  countActivities: Partial<CountActivities> = {};
  groupId: string = 'LESSON';

  constructor(event: Partial<LiteEvent> = {}) {
    this.date = event.date || '';
    this.weekday = event.weekday || 'UNIQUE';
    this.startTime = event.startTime || '';
    this.endTime = event.endTime || '';
    this.schoolId = event.schoolId || 0;
    this.schoolAcronym = event.schoolAcronym || '';
    this.lessonId = event.lessonId || 0;
    this.classId = event.classId || 0;
    this.classCode = event.classCode || '';
    this.timeScheduleId = event.timeScheduleId || 0;
    this.degreeId = event.degreeId || 0;
    this.curricularComponentId = event.curricularComponentId || 0;
    this.curricularComponentName = event.curricularComponentName || '';
    this.teacherId = event.teacherId || 0;
    this.teacherName = event.teacherName || '';
    this.testId = event.testId || 0;
    this.testType = event.testType || '';
    this.testStatus = event.testStatus || '';
    this.workId = event.workId || 0;
    this.workStatus = event.workStatus || '';
    this.color = event.color || '';
    this.countActivities = event.countActivities || {};
    this.groupId = event.groupId || 'LESSON';
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
  lessonId: number,
  classId: number,
  classCode: string,
  frequencyId: number,
  timeScheduleId: number,
  proofId: number,
  proofType: string,
  workId: number,
  weekday: Weekday,
  selected?: boolean
}
