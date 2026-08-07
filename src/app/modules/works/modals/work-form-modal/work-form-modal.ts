import { Component, inject, input, ChangeDetectionStrategy, viewChild } from '@angular/core';
import { Button } from '@ui/button/button';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogTitle
} from '@angular/material/dialog';
import { ModalComponent } from '@ui/modal/modal.component';
import { TranslatePipe } from '@ngx-translate/core';
import { WorkFormComponent } from '@modules/common/form/work-form/work-form.component';
import { GeneralEvent, LessonEvent, Test, Work } from '@models';
import { NgClass } from '@angular/common';
import { WorkService } from '@services/work.service';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { WorkDeleteModal } from '@modules/works/modals/work-delete-modal/work-delete-modal.component';
import { BaseModal } from '@modules/modals/base-modal/base-modal';
import Swal from 'sweetalert2';
import { firstValueFrom, take } from 'rxjs';
import { ActivityDuplicate } from '@ui/event-select-modal/activity-duplicate';

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
    WorkDeleteModal
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
  override modal = viewChild<ModalComponent>('modal');
  statusClass: any = Work.statusClass;

  constructor() {
    super();
    this.data.set(new Work());
  }

  async onSubmit(goNext?: boolean) {
    if (this.readonly()) {
      return;
    }
    if (this.form.valid) {
      const work = this.form.getRawValue() as Work;
      const {lessonId, date, timeScheduleId} = this.data() || {};
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

      const workResponse = await firstValueFrom(data.id ? this.workService.update(data) : this.workService.add(data));
      if (workResponse.id) {
        this.alert('Salvo com sucesso!');
        this.form.reset();
        this.modal()?.close({data: workResponse, goNext});
      }

      // const request$ = data.id ? this.workService.update(data) : this.workService.add(data);
      // request$.subscribe({
      //   next: (response) => {
      //     this.alert('Salvo com sucesso!');
      //     this.form.reset();
      //     this.modal.close({data: response, goNext});
      //   },
      //   error: (error) => {
      //     console.error('Work Add Error:', error);
      //     // this.form.setErrors({ temp: true });
      //   }
      // })
    }
  }

  protected onApprove() {
    const data = this.data();
    if (!data) {
      return;
    }
    this.workService.approve(data).subscribe((work: Work) => {
      this.alert('Aprovado com sucesso!');
      this.modal()?.close(work);
      this.data.set(work);
    });
  }

  protected onReject() {
    const data = this.data();
    if (!data) {
      return;
    }
    this.workService.reject(data).subscribe((work: Work) => {
      this.alert('Reprovado com sucesso!');
      this.modal()?.close(work);
      this.data.set(work);
    });
  }

  // protected setModal($event: ModalComponent) {
  //   this.modal = $event;
  // }

  onDeleteWork($event: boolean) {
    if ($event) {
      this.alert('Trabalho excluído com sucesso!');
      this.form.reset();
      this.close(this.data());
    }
  }
}
