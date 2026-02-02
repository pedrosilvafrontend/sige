import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { EvaluationCriterion, EvaluationItem, Work } from '@models';


export interface IEvaluationItemForm {
  id: FormControl<number | null>;
  criterionCode: FormControl<string | null>;
  score: FormControl<string | undefined | null>;
  description: FormControl<string | undefined | null>;
  position: FormControl<number | null>;
  deft: FormControl<boolean | null>;
}

export interface IEvaluationCriterionForm {
  id: FormControl<number | null>;
  code: FormControl<string | null | undefined>;
  description: FormControl<string | null | undefined>;
  items: FormArray<FormGroup<IEvaluationItemForm>>;
  position: FormControl<number | null>;
  deft: FormControl<boolean | null>;
}


export class EvaluationForm {
  private static fb = new FormBuilder();

  static form(data?: Partial<EvaluationItem>): FormGroup<IEvaluationItemForm> {
    const ctrls = {
      id: this.fb.control(data?.id || null),
      criterionCode: this.fb.control(data?.criterionCode || null),
      score: this.fb.control(data?.score, [Validators.required]),
      description: this.fb.control(data?.description, [Validators.required]),
      position: this.fb.control(data?.position || null),
      deft: this.fb.control(data?.deft || false)
    };

    return this.fb.group(ctrls);
  }
}


export class EvaluationCriterionForm {
  private static fb = new FormBuilder();

  static form(data?: Partial<EvaluationCriterion>): FormGroup<IEvaluationCriterionForm> {
    const ctrls = {
      id: [data?.id || null],
      code: [data?.code, [Validators.required]],
      items: this.fb.array<FormGroup<IEvaluationItemForm>>([]),
      description: [data?.description],
      deft: [data?.deft || false],
      position: [data?.position || null]
    };

    const form = this.fb.group(ctrls);
    const { items } = form.controls;

    (data?.items || []).forEach(evaluation => {
      items.push(EvaluationForm.form(evaluation));
    });

    return form;
  }
}
