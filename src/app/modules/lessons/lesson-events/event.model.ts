import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { Activity } from '@modules/config/activity/activity.model';
import { IProofForm } from '@form/proof.form';
import { LessonBatch, School, Proof, Work } from '@models';
import { IWorkForm } from '@form/work.form';

export interface SchoolEvent {
  id?: string;
  title: string;
  groupId: string;
  startDate: string;
  endDate: string;
  observations: string;
  activities: Activity[];
  school?: School;
  test?: Proof;
  work?: Work;
  lesson?: Partial<LessonBatch>;
}

export type { SchoolEvent as LesEvent }

export interface LesEventForm {
  id: AbstractControl<string>;
  title: AbstractControl<string>;
  groupId: AbstractControl<string>;
  date: FormControl<string>;
  startHour: AbstractControl<string>;
  endHour: AbstractControl<string>;
  activities: FormArray;
  test?: FormGroup<IProofForm>;
  work?: FormGroup<IWorkForm>;
  observations: AbstractControl<string>;
}

export interface LesEventFormValue {
  id?: string;
  title: string;
  groupId: string;
  date: string;
  startHour: string;
  endHour: string;
  observations: string;
  activities: Activity[];
  test?: Proof
  work?: Work
}
