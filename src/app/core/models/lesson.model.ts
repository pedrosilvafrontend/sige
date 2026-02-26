import {
  ClassForm,
  Entity,
  EntityForm,
  User,
  UserForm,
  School,
  SchoolClass,
  CurricularComponent,
  TimeSchedule
} from '@models';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ISchoolForm, IUserForm } from '@form';

export interface ILessonForm {
  id: FormControl<number>;
  curricularComponent: FormGroup<EntityForm<number> | null>;
  schoolClass: FormGroup<ClassForm | null>;
  dayShiftId: FormGroup<EntityForm | null>;
  teacher: FormGroup<IUserForm>;
  school?: FormGroup<ISchoolForm>;
  timeSchedule: FormControl<TimeSchedule | null>;
  semester: FormControl<string>;
  date: FormControl<string>;
  frequencies: FormArray<FormGroup<ILessonFrequency>>;
  endDate: FormControl<string>;
  description: FormControl<string>;
}

export interface ILessonFrequency {
  id?: FormControl<number | null>;
  weekday: FormControl<string | null>;
  timeSchedule: FormControl<TimeSchedule | null>;
}

export class LessonBatch {
  id?: number;
  ref?: string;
  title?: string;
  curricularComponent: CurricularComponent | null;
  schoolClass: SchoolClass | null;
  dayShift: Entity | null;
  teacher: User | null;
  school?: Partial<School>;
  date: string;
  frequencies: Frequency[] = [];
  endDate?: string;
  description: string;

  constructor(lesson: Partial<LessonBatch> = {}) {
    {
      this.id = lesson.id;
      this.curricularComponent = lesson.curricularComponent || null;
      this.schoolClass = lesson.schoolClass || null;
      this.dayShift = lesson.dayShift || null;
      this.teacher = lesson.teacher || null;
      this.school = lesson.school;
      this.date = lesson.date || '';
      this.endDate = lesson.endDate || undefined;
      this.description = lesson.description || '';
      this.ref = lesson.ref || '';
    }
  }
}

export class Frequency {
  id?: number;
  weekday: string;
  timeSchedule: TimeSchedule | null;

  constructor(lesson: Partial<Frequency> = {}) {
    {
      this.id = lesson.id;
      this.weekday = lesson.weekday || '';
      this.timeSchedule = lesson.timeSchedule || null;
    }
  }
}
