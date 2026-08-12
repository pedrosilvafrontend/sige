import { Component, inject, input, ChangeDetectionStrategy } from '@angular/core';
import { Button } from '@ui/button/button';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogTitle
} from '@angular/material/dialog';
import { ModalComponent } from '@ui/modal/modal.component';
import { TranslatePipe } from '@ngx-translate/core';
import { WorkFormComponent } from '@modules/common/form/work-form/work-form.component';
import { LessonEvent, SchoolClass, Work } from '@models';
import { DatePipe, NgClass, SlicePipe } from '@angular/common';
import { WorkService } from '@services/work.service';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { DeleteWorkModal } from '@modules/works/modals/delete-work-modal/delete-work-modal';
import { BaseModal } from '@modules/modals/base-modal/base-modal';

@Component({
  selector: 'app-work-form-modal',
  imports: [
    Button,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    ModalComponent,
    TranslatePipe,
    WorkFormComponent,
    NgClass,
    MatIcon,
    MatIconButton,
    DeleteWorkModal,
    DatePipe,
    SlicePipe
  ],
  templateUrl: './work-form-modal.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './work-form-modal.scss',
})
export class WorkFormModal extends BaseModal<Work> {
  private workService = inject(WorkService);
  readonly = input(false);
  schoolId = input.required<number>();
  workInput = input.required<Work>({ alias: 'work' });
  event = input<LessonEvent>();
  allowDuplicate = input<boolean>(true);
  statusClass: any = Work.statusClass;

  constructor() {
    super();
    this.data = new Work();
  }

  onSubmit(nextMode?: boolean) {
    if (this.readonly()) {
      return;
    }
    if (this.form.valid) {
      const work = this.form.getRawValue() as Work;
      const {lessonId, date, timeScheduleId} = this.data;
      if (!lessonId || !date || !timeScheduleId) {
        this.alert('Erro ao salvar');
        return;
      }
      const data = {
        ...work,
        lessonId,
        date,
        timeScheduleId,
      }
      const request$ = data.id ? this.workService.update(data) : this.workService.add(data);
      request$.subscribe({
        next: (response) => {
          this.alert('Salvo com sucesso!');
          this.form.reset();
          this.modal.close({ success: true, nextMode, data: response });
        },
        error: (error) => {
          console.error('Work Add Error:', error);
          // this.form.setErrors({ temp: true });
        }
      })
    }
  }

  protected onApprove() {
    this.workService.approve(this.data).subscribe((work: Work) => {
      this.alert('Aprovado com sucesso!');
      this.modal?.close({data: work});
      this.data = work;
    });
  }

  protected onReject() {
    this.workService.reject(this.data).subscribe((work: Work) => {
      this.alert('Reprovado com sucesso!');
      this.modal?.close({data: work});
      this.data = work;
    });
  }

  protected setModal($event: ModalComponent) {
    this.modal = $event;
  }

  onDeleteWork($event: boolean) {
    if ($event) {
      this.alert('Trabalho excluído com sucesso!');
      this.form.reset();
      this.data = new Work();
      this.modal.close({data: this.data, action: 'delete'});
    }
  }
}
