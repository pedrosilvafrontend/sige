import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Proof } from '@models';

export class ProofForm {
  private static fb = new FormBuilder();

  static form(data?: Partial<Proof>): FormGroup<IProofForm> {
    const ctrls = {
      id: [data?.id || null],
      title: [data?.title || null],
      content: [data?.content || null, [Validators.required]],
      whereToFindIt: [data?.whereToFindIt || null],
      score: [data?.score || null, [Validators.required]],
      status: [data?.status || null],
      date: [data?.date || null],
      timeScheduleId: [data?.timeScheduleId || null],
      lessonId: [data?.lessonId || null],
    };
    return this.fb.group(ctrls);
  }
}

export interface IProofForm {
  id: FormControl<number | null>;
  title: FormControl<string | null>;
  content: FormControl<string | null>;
  whereToFindIt: FormControl<string | null>;
  score: FormControl<string | null>;
  status: FormControl<string | null>;
  date: FormControl<string | null>;
  timeScheduleId: FormControl<number | null>;
  lessonId: FormControl<number | null>;
}
