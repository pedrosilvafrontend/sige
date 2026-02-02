import { ChangeDetectionStrategy, Component, effect, inject, input, OnInit, output } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WorkService } from '@services/work.service';
import { IWorkForm, WorkForm } from '@form/work.form';
import { EvaluationCriterion, Work } from '@models';
import { Field } from '@ui/field/field';
import { Textarea } from '@ui/field/textarea/textarea';
import { TranslatePipe } from '@ngx-translate/core';
import { JsonPipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { EvaluationCriterionService } from '@services/evaluation.service';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';

@Component({
  selector: 'app-work-form',
  imports: [
    Field,
    FormsModule,
    ReactiveFormsModule,
    Textarea,
    TranslatePipe,
    MatError,
    MatFormField,
    MatLabel,
    MatOption,
    MatSelect,
  ],
  templateUrl: './work-form.component.html',
  styleUrl: './work-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkFormComponent implements OnInit {
  private workService = inject(WorkService);
  private evaluationCriterionService = inject(EvaluationCriterionService);
  public form: FormGroup<IWorkForm> = this.createForm();
  public criteria: EvaluationCriterion[] = [];
  public defaultCriteria: string = '';

  public schoolId = input<number>(0);
  public data = input<Partial<Work>>({});
  public dataId = input<number>();
  public disabled = input(false);
  public readOnly = input(false);
  public form$ = output<FormGroup<IWorkForm>>();

  constructor() {
    effect(() => {
      const disabled = this.disabled();
      const readOnly = this.readOnly();
      if (disabled || readOnly) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    })
  }

  createForm() {
    return WorkForm.form();
  }

  addCriterion() {

  }

  // addEvaluation() {
  //   // this.evaluationsFormValue = this.form.controls.evaluations.value;
  //   const position = this.evaluationsFormValue.length;
  //   // this.evaluationsFormValue.push({ position } as any);
  //   this.form.controls.evaluations.push(EvaluationForm.form({ position }), { emitEvent: false });
  // }

  // setEvaluationsForm(form: UntypedFormArray) {
  //   this.form.setControl('evaluations', form);
  // }

  // setEvaluationForm(form: FormGroup, index: number) {
  //   const target = this.form.controls.evaluations.controls.at(index);
  //   if (!target?.get('criterionCode')) {
  //     form.patchValue({ position: index }, { emitEvent: false });
  //     const { evaluations } = this.form.controls;
  //     evaluations.setControl(index, form);
  //     this.evaluationsFormValue = evaluations.value;
  //     console.log(form);
  //   }
  // }

  async ngOnInit() {
    this.form$.emit(this.form);
    this.criteria = await firstValueFrom(this.evaluationCriterionService.getAll({schoolId: this.schoolId()})) || [];
    this.defaultCriteria = (this.criteria || '').map((c) => {
      const items = (c.items || []).map((i) => {
        return `${i.score} - ${i.description}`;
      }).join('\n');
      return `${c.code} - ${c.description}\n${items}`;
    }).join('\n\n');


    if (this.data()) {
      this.form.patchValue(this.data());
    }

    if (this.dataId()) {
      this.workService.getById(this.dataId()).subscribe((data) => {
        this.form.patchValue(data);
      });
    }

    if (!this.form.controls.evaluationCriteria.value) {
      this.form.controls.evaluationCriteria.patchValue(this.defaultCriteria);
    }
  }


}
