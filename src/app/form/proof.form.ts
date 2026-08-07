import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CurricularComponent, Test, ProofType, UniqueLessonEvent } from '@models';

export class ProofForm {
  private static fb = new FormBuilder();

  static form(data?: Partial<Test>): FormGroup<ITestForm> {
    const fb = this.fb.nonNullable;
    const ctrls = {
      id: [data?.id || null],
      type: fb.control(data?.type || 'TEST', [Validators.required]),
      schoolId: [data?.schoolId || null],
      lessonId: [data?.lessonId || null],
      title: [data?.title || null],
      content: [data?.content || null],
      whereToFindIt: [data?.whereToFindIt || null],
      score: [data?.score || null],
      status: [data?.status || null],
      date: [data?.date || null],
      timeScheduleId: [data?.timeScheduleId || null],
      events: this.fb.array<FormControl<UniqueLessonEvent>>([]),
      // tests: this.fb.array<FormControl<Proof>>([]),
      curricularComponentId: [data?.curricularComponentId || 0],
      curricularComponent: [data?.curricularComponent || null, [Validators.required]]
    };
    return this.fb.group(ctrls);
  }
}

export interface ITestForm {
  id: FormControl<number | null>;
  type: FormControl<ProofType>;
  schoolId: FormControl<number | null>;
  lessonId: FormControl<number | null>;
  title: FormControl<string | null>;
  content: FormControl<string | null>;
  whereToFindIt: FormControl<string | null>;
  score: FormControl<string | null>;
  status: FormControl<string | null>;
  date: FormControl<string | null>;
  timeScheduleId: FormControl<number | null>;
  events: FormArray<FormControl<UniqueLessonEvent>>;
  // tests: FormArray<FormControl<Proof>>;
  curricularComponentId: FormControl<number | null>;
  curricularComponent: FormControl<CurricularComponent | null>;
}
