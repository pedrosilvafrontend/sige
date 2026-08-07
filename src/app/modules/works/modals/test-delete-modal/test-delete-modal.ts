import { Component, inject, input } from '@angular/core';
import { BaseModal } from '@modules/modals/base-modal/base-modal';
import { Button } from '@ui/button/button';
import { MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { ModalComponent } from '@ui/modal/modal.component';
import { LessonEvent, Test } from '@models';
import { TestService } from '@core/services/test.service';
import { MessageService } from '@services/message.service';

export interface TestDeleteResponse {
  success: boolean;
  refresh: boolean;
}

@Component({
  selector: 'app-test-delete-modal',
  imports: [
    Button,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    ModalComponent
  ],
  templateUrl: './test-delete-modal.html',
  styleUrl: './test-delete-modal.scss',
})
export class TestDeleteModal extends BaseModal<Test, TestDeleteResponse> {
  event = input.required<LessonEvent>();
  private testService = inject(TestService);
  private message = inject(MessageService);

  deleteProof(callback?: () => void) {
    const proof = this.form.value;
    this.testService.deleteItem(proof.id || 0).subscribe(() => {
      this.message.success('Prova excluída com sucesso!');
      this.form.reset();
      Object.assign(this.event().evalTools.test || {}, this.form.value);
      this.close({ success: true, refresh: true });
      callback?.();
    })
  }

  deleteAllProofs(callback?: () => void) {
    const proof = this.form.value;
    if (proof.type === 'MULTICLASS_TEST') {
      this.testService.deleteAll(proof.id || 0).subscribe(() => {
        this.message.success('Provas excluídas com sucesso!');
        this.form.reset();
        Object.assign(this.event().evalTools.test || {}, this.form.value);
        this.close({ success: true, refresh: true });
        callback?.();
      })
    }
  }

  cancel() {
    this.close({ success: false, refresh: false });
  }
}
