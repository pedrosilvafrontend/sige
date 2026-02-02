import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Work } from '@models';
import { FormValidators, IEvaluationCriterionForm, IEvaluationItemForm } from '@form';

export class WorkForm {

  private static fb = new FormBuilder();

  static form(data?: Partial<Work>): FormGroup<IWorkForm> {
    const ctrls = {
      id: [data?.id || null],
      title: [data?.score, [Validators.required]],
      score: [data?.score, [Validators.required]],
      local: [data?.local, [Validators.required]],
      evaluationCriteria: [data?.evaluationCriteria],
      // evaluations: this.fb.array<FormGroup<IEvaluationCriterionForm>>([]),
      description: [data?.description],
    };

    const form: FormGroup<IWorkForm> = this.fb.group(
      ctrls,
      // {
      //   validators: [FormValidators.requiredIf(['id', 'title', 'score', 'local', 'evaluationCriteria', 'description'])],
      // }
    );
    // const { evaluations } = form.controls;

    // (data?.evaluations || []).forEach(evaluation => {
    //   const evaluationForm = this.fb.group<IEvaluationItemForm>({
    //     id: this.fb.control(evaluation?.id || null),
    //     criterionCode: this.fb.control(evaluation?.criterionCode || null, [Validators.required]),
    //     score: this.fb.control(evaluation?.score, [Validators.required]),
    //     description: this.fb.control(evaluation?.description),
    //     position: this.fb.control(evaluation?.position, [Validators.required]),
    //     deft: this.fb.control(evaluation?.deft || false)
    //   });
    //   evaluations.push(evaluationForm);
    // });

    return form;
  }
}


export interface IWorkForm {
  id: FormControl<number | null>;
  title: FormControl<string | null | undefined>;
  score: FormControl<string | null | undefined>;
  local: FormControl<string | null | undefined>;
  evaluationCriteria: FormControl<string | null | undefined>;
  // evaluations: FormArray<FormGroup<IEvaluationCriterionForm>>;
  description: FormControl<string | null | undefined>;
}
