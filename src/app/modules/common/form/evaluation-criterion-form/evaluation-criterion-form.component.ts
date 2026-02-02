import { Component, effect, inject, input, OnInit, output } from '@angular/core';
import { EvaluationCriterionService } from '@services/evaluation.service';
import { FormGroup } from '@angular/forms';
import { Work } from '@models';
import { EvaluationForm } from '@form/evaluation.form';

@Component({
  selector: 'app-evaluation-criterion-form',
  imports: [],
  templateUrl: './evaluation-criterion-form.component.html',
  styleUrl: './evaluation-criterion-form.component.scss'
})
export class EvaluationCriterionFormComponent implements OnInit {
  private evaluationCriterionService = inject(EvaluationCriterionService);
  public form: FormGroup = this.createForm();

  public data = input<Partial<Work>>({});
  public dataId = input<number>();
  public disabled = input(false);
  public readOnly = input(false);
  public form$ = output<FormGroup>();

  constructor() {
    effect(() => {
      const disabled = this.disabled();
      const readOnly = this.readOnly();
      if (disabled || readOnly) {
        this.form.disable();
      } else {
        this.form.enable();
      }

      if (this.data()) {
        this.form.patchValue(this.data());
      }

      if (this.dataId()) {
        this.evaluationCriterionService.getById(this.dataId()).subscribe((data) => {
          this.form.patchValue(data);
        });
      }
    })
  }

  createForm() {
    // EvaluationCriterionForm.form();
    return EvaluationForm.form();
  }

  ngOnInit() {
    this.form$.emit(this.form);
  }


}
