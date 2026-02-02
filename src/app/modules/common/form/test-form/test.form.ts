import { Component, effect, inject, input, OnInit, output } from '@angular/core';
import { AbstractControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IProofForm, ProofForm } from '@form/proof.form';
import { Field } from '@ui/field/field';
import { Proof } from '@models';
import { TestService } from '@services/test.service';
import { TranslatePipe } from '@ngx-translate/core';
import { Textarea } from '@ui/field/textarea/textarea';

@Component({
  selector: 'app-test-form',
  imports: [
    Field,
    ReactiveFormsModule,
    TranslatePipe,
    Textarea,
  ],
  templateUrl: './test.form.html',
  styleUrl: './test.form.scss'
})
export class TestFormComponent implements OnInit {
  private testService = inject(TestService);
  public form: FormGroup<IProofForm> = this.createForm();

  public data = input<Partial<Proof>>({});
  public dataId = input<number>();
  public disabled = input(false);
  public readOnly = input(false);
  public form$ = output<FormGroup<IProofForm>>();

  constructor() {
    effect(() => {
      const disabled = this.disabled();
      const readOnly = this.readOnly();
      if (disabled || readOnly) {
        this.form.disable();
      } else {
        this.form.enable();
      }

      // if (this.dataId()) {
      //   this.testService.getById(this.dataId()).subscribe((data) => {
      //     this.form.patchValue(data);
      //   });
      // }
    })
  }

  createForm() {
    return ProofForm.form();
  }

  ngOnInit() {
    if (this.data()) {
      this.form.patchValue(this.data());
    }
    this.form$.emit(this.form);
  }

}
