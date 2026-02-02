import { ChangeDetectionStrategy, Component, effect, inject, input, OnInit, output, Signal } from '@angular/core';
import { ControlValueAccessor, FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatError, MatFormField } from '@angular/material/form-field';
import { MatLabel } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { TranslatePipe } from '@ngx-translate/core';
import { EvaluationCriterion } from '@models';
import { EvaluationCriterionService } from '@services/evaluation.service';
import { firstValueFrom } from 'rxjs';
import { forwardRef } from '@angular/core';

@Component({
  selector: 'app-criterion-select',
  imports: [
    FormsModule,
    MatError,
    MatFormField,
    MatLabel,
    MatOption,
    MatSelect,
    ReactiveFormsModule,
    TranslatePipe
  ],
  templateUrl: './criterion-select.html',
  styleUrl: './criterion-select.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CriterionSelect),
      multi: true
    }
  ]
})
export class CriterionSelect implements OnInit, ControlValueAccessor {
  private evaluationCriterionService = inject(EvaluationCriterionService);
  public criteria: EvaluationCriterion[] = [];
  data = input<string>();
  schoolId = input<number>(0);
  // criterionsInput = input([] as EvaluationCriterion[], {
  //   alias: 'criterions'
  // });
  form = new FormControl('', { nonNullable: true, validators: [Validators.required] });
  noItemsMessage = 'No criteria found';

  // CVA callbacks
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  form$ = output<FormControl<string>>();
  change$ = output<string>();

  constructor() {
    effect(() => {
      // if (this.criterionsInput()) {
      //   this.criterions = this.criterionsInput();
      //   this.form.patchValue(this.criterions[0]?.id?.toString() || '');
      // }

      if (this.data()) {
        this.form.patchValue(this.data() || '', { emitEvent: false });
      }
    });

    // propagate changes to outside form control
    this.form.valueChanges.subscribe((value) => {
      const v = value ?? '';
      this.onChange(v);
      this.change$.emit(v);
    });
  }

  change(change: MatSelectChange<string>) {
    this.form.setValue(change.value || '');
    // change event will be propagated by valueChanges subscription
  }

  markAsTouched() {
    if (!this.form.touched) {
      this.onTouched();
      this.form.markAsTouched();
    }
  }

  writeValue(value: unknown): void {
    const v = (typeof value === 'string' || value == null) ? (value ?? '') : '';
    this.form.setValue(v, { emitEvent: false });
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.form.disable({ emitEvent: false });
    } else {
      this.form.enable({ emitEvent: false });
    }
  }

  async ngOnInit() {
    this.form$.emit(this.form);
    this.criteria = await firstValueFrom(this.evaluationCriterionService.getAll({schoolId: this.schoolId()})) || [];
  }

}
