import { Component, effect, input, output, signal, viewChild } from '@angular/core';
import { Button } from '@ui/button/button';
import { MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { Test } from '@models';
import { ModalComponent } from '@ui/modal/modal.component';
import { Field } from '@ui/field/field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Textarea } from '@ui/field/textarea/textarea';
import { disabled, form, FormField, FormRoot } from '@angular/forms/signals';

@Component({
  selector: 'ui-test-compare-modal',
  imports: [
    Button,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    MatIcon,
    MatIconButton,
    TranslatePipe,
    ModalComponent,
    Field,
    FormsModule,
    ReactiveFormsModule,
    Textarea,
    FormField,
    FormRoot
  ],
  templateUrl: './test-compare-modal.html',
  styleUrl: './test-compare-modal.scss',
})
export class TestCompareModal {
  modal = viewChild<ModalComponent>('modal');
  actionLabel = input<string>('Override');
  actionLabelNo = input<string>('No override');
  title = input<string>('The proof already exists, do you wish to overwrite it?');
  subtitle = input<string>('');
  actionClickOut = output<boolean>({ alias: 'actionClick' });
  testAIn = input.required<Test>({ alias: 'testA' });
  testBIn = input.required<Test>({ alias: 'testB' });
  protected testA = signal<Test>(new Test());
  protected testB = signal<Test>(new Test());

  formA = form(this.testA, (path) => {
    disabled(path);
  });
  formB = form(this.testB, (path) => {
    disabled(path);
  });

  constructor() {
    effect(() => {
      this.testA.set(this.testAIn());
      this.testB.set(this.testBIn());
    });
  }

  open() {
    return this.modal()?.open();
  }

  close(value: boolean) {
    this.modal()?.close(value);
  }

  actionClick(value: boolean) {
    this.actionClickOut.emit(value);
    this.modal()?.close(value);
  }
}
