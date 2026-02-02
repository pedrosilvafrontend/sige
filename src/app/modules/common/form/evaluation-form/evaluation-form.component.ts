import { ChangeDetectionStrategy, Component, effect, inject, input, OnInit, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { EvaluationCriterion, EvaluationItem } from '@models';
import { EvaluationCriterionService, EvaluationService } from '@services/evaluation.service';
import { Field } from '@ui/field/field';
import { TranslatePipe } from '@ngx-translate/core';
import { EvaluationForm } from '@form/evaluation.form';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-evaluation-form',
  imports: [
    ReactiveFormsModule,
    Field,
    TranslatePipe,
  ],
  templateUrl: './evaluation-form.component.html',
  styleUrl: './evaluation-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EvaluationFormComponent implements OnInit {
  private evaluationService = inject(EvaluationService);
  private evaluationCriterionService = inject(EvaluationCriterionService);
  public form: FormGroup = this.createForm();
  public criterions: EvaluationCriterion[] = [];

  public data = input<Partial<EvaluationItem>>({});
  public dataId = input<number>();
  public schoolId = input<number>();
  public disabled = input(false);
  public readOnly = input(false);
  public inputForm = input<FormGroup>(this.createForm(), { alias: 'form' });
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

      if (this.inputForm()) {
        this.form = this.inputForm();
        this.form.patchValue(this.data() || {});
      }
      else {
        this.form.patchValue(this.data() || {});
      }

    })
  }

  createForm(): UntypedFormGroup {
    return EvaluationForm.form();
  }

  async ngOnInit() {
    if (this.schoolId()) {
      this.criterions = await firstValueFrom(this.evaluationCriterionService.getAll({ schoolId: this.schoolId() })) || [];
    }
    if(!this.inputForm()) {
      this.form$.emit(this.form);
    }
  }


}
