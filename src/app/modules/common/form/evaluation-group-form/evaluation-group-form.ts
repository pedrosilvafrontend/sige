import { Component, effect, inject, input, OnInit, output, Signal, ViewEncapsulation } from '@angular/core';
import { Button } from '@ui/button/button';
import { EvaluationFormComponent } from '@modules/common/form/evaluation-form/evaluation-form.component';
import { EvaluationCriterionService } from '@services/evaluation.service';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EvaluationCriterion } from '@models';
import { EvaluationCriterionForm, EvaluationForm, IEvaluationCriterionForm } from '@form/evaluation.form';
import { firstValueFrom } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { CriterionSelect } from '@modules/common/form/criterion-select/criterion-select';

@Component({
  selector: 'app-evaluation-group-form',
  imports: [
    Button,
    EvaluationFormComponent,
    TranslatePipe,
    CriterionSelect,
    ReactiveFormsModule
  ],
  templateUrl: './evaluation-group-form.html',
  styleUrl: './evaluation-group-form.scss',
  encapsulation: ViewEncapsulation.None
})
export class EvaluationGroupForm implements OnInit {
  private evaluationCriterionService = inject(EvaluationCriterionService);
  public form: FormArray<FormGroup<IEvaluationCriterionForm>> = new FormArray<FormGroup<IEvaluationCriterionForm>>([] as FormGroup<IEvaluationCriterionForm>[]);
  public mainForm = new FormGroup({
    criterionCode: new FormControl(''),
    topics: this.form,
  });
  public criteria: EvaluationCriterion[] = [];
  // public defaultCriteria: Signal<EvaluationCriterion[]> = this.evaluationCriterionService.evaluationCriteria;
  // public criterionForm = EvaluationCriterionForm.form();
  // public criterionCodeControl = new FormControl('');

  public data = input<EvaluationCriterion[]>([]);
  public schoolId = input<number>(0);
  public disabled = input(false);
  public readOnly = input(false);
  public form$ = output<FormArray>();

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
        this.criteria = this.data() || [];
        // this.patchValue(this.data() || []);
      }

      // else if (this.defaultCriteria()) {
      //   // this.patchValue(this.defaultCriteria() || []);
      //   this.criteria = this.defaultCriteria() || [];
      // }
    })
  }

  patchValue(criteria: EvaluationCriterion[]) {
    (criteria || []).forEach((criterion, index) => {
      const position = index+1;
      const value = {
        ...criterion,
        position,
        items: (criterion?.items || []).map((item, itemIndex) => ({
          ...item,
          position: itemIndex+1
        }))
      }
      if (this.form.at(index)) {
        this.form.setControl(index, EvaluationCriterionForm.form(value));
      } else {
        this.form.push(EvaluationCriterionForm.form(value));
      }
      console.log(value);
      const itemsForm = this.form.at(index)?.get('items') as FormArray;
      for (let i = (itemsForm || []).length; i > value.items.length; i--) {
        itemsForm.removeAt(i-1);
      }
      (criterion?.items || []).forEach((item, itemIndex) => {
        if (itemsForm) {
          itemsForm.push(EvaluationForm.form({...item, position: itemIndex+1, criterionCode: criterion.code }));
        }
      })

    })

    if (this.form.length > criteria.length) {
      this.form.removeAt(criteria.length);
    }
  }

  addEvaluation(index: number) {
    const criterionForm = this.form.at(index);
    const itemsForm = criterionForm?.get('items') as FormArray;
    if (!itemsForm) {
      return;
    }
    const position = itemsForm.length+1;
    const criterionCode = criterionForm.controls.code.value || '';
    itemsForm.push(EvaluationForm.form({ position, criterionCode }));
  }

  addCriterion() {
    const position = this.form.length+1;
    this.form.push(EvaluationCriterionForm.form({ position }));
  }

  // setCriterionCodeControl(criterionCodeControl: FormControl, index: number) {
  //   const criterionForm = this.form.at(index);
  //   const itemsForm = criterionForm?.controls.items;
  //   if (!itemsForm) {
  //     return;
  //   }
  //   criterionForm.setControl('code', criterionCodeControl);
  // }

  onCriterionChange(criterionCode: string, index: number) {
    const criterionForm = this.form.at(index);
    const itemsForm = criterionForm?.controls.items;
    itemsForm.controls.forEach((form) => {
      form.patchValue({ criterionCode: criterionCode});
    })
  }

  async ngOnInit() {
    this.form$.emit(this.form);

    if (this.schoolId()) {
      this.evaluationCriterionService.getAll({schoolId: this.schoolId()}).subscribe((data) => {
        this.criteria = data || [];
        this.patchValue(this.criteria);
      })
    }
    // if (!this.criteria.length) {
    //   this.criteria = this.defaultCriteria() || [];
    // }
    // this.patchValue(this.criteria);
  }


}
