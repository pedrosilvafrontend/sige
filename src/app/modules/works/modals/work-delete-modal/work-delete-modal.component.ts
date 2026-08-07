import { Component, inject, input, output, ChangeDetectionStrategy } from '@angular/core';
import { Button } from '@ui/button/button';
import { MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { ModalComponent } from '@ui/modal/modal.component';
import { Work } from '@models';
import { firstValueFrom, take } from 'rxjs';
import { WorkService } from '@services/work.service';

@Component({
  selector: 'app-work-delete-modal',
  imports: [
    Button,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    ModalComponent,
  ],
  templateUrl: './work-delete-modal.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './work-delete-modal.component.scss',
})
export class WorkDeleteModal {
  work = input.required<Work>();
  close = output<boolean>();
  private workService = inject(WorkService);
  modal: ModalComponent | undefined;

  setModal(modal: ModalComponent) {
    this.modal = modal;
  }

  open(modal?: ModalComponent) {
    (modal || this.modal)?.open().afterClosed().pipe(take(1)).subscribe((response: boolean) => {
      if (response) {
        this.deleteWork().then((resp) => {
          this.close.emit(resp);
        });
      }
      this.close.emit(response);
    })
  }

  async deleteWork() {
    const work = this.work();
    await firstValueFrom(this.workService.deleteItem(work.id || 0));
    return true;
  }

}
