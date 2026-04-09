import { Component, effect, inject, input, output } from '@angular/core';
import { Button } from '@ui/button/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { ModalComponent, ModalDialogComponent, ModalOutput } from '@ui/modal/modal.component';
import { TranslatePipe } from '@ngx-translate/core';
import { WorkFormComponent } from '@modules/common/form/work-form/work-form.component';
import { Work } from '@models';
import { FormGroup } from '@angular/forms';
import { IWorkForm } from '@form/work.form';
import { NgClass } from '@angular/common';
import { AuthService } from '@services';
import { WorkService } from '@services/work.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { take } from 'rxjs';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { DeleteWorkModal } from '@modules/works/modals/delete-work-modal/delete-work-modal';

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
    MatDialogClose,
    MatIcon,
    MatIconButton,
    DeleteWorkModal
  ],
  templateUrl: './work-form-modal.html',
  styleUrl: './work-form-modal.scss',
})
export class WorkFormModal {
  private authService = inject(AuthService);
  private workService = inject(WorkService);
  private snackBar = inject(MatSnackBar);

  modal!: ModalComponent;
  modal$ = output<ModalOutput<Work>>({ alias: 'modal' });

  auth = this.authService.user$.value;
  disabled = input(false);
  disabledButton = input(false);
  readonly = input(false);
  // workInput = input.required<Work>({ alias: 'work' });
  schoolId = input.required<number>();
  workInput = input.required<Work>({ alias: 'work' })
  work: Work = new Work();
  form!: FormGroup<IWorkForm>;
  statusClass: any = Work.statusClass;
  ref!: MatDialogRef<ModalDialogComponent, any>;
  ref$ = output<MatDialogRef<ModalDialogComponent, any>>({ alias: 'ref' })

  constructor() {
    this.open = this.open.bind(this);
    effect(() => {
      if (this.workInput()) {
        console.log('workInput changed', this.workInput());
        this.work = {
          ...this.workInput(),
        };
      }
    });
  }

  open(data?: Work) {
    this.work = {
      ...this.workInput(),
      ...(data || {}),
    };
    this.ref = this.modal?.open();
    this.ref?.afterClosed().pipe(take(1)).subscribe((response: Work) => {
      if (response) {
        this.form.reset(response);
      }
    });
    this.ref$.emit(this.ref);
    return this.ref;
  }

  close() {
    this.modal?.close();
  }

  closeRefresh() {
    this.modal?.close(this.work);
  }

  onSubmit() {
    if (this.form.valid) {
      const work = this.form.getRawValue() as Work;
      const {lessonId, date, timeScheduleId} = this.work;
      if (!lessonId || !date || !timeScheduleId) {
        this.showNotification('danger', 'Erro ao salvar');
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
          this.showNotification('success', 'Salvo com sucesso!');
          this.form.reset();
          this.modal.close(response);
        },
        error: (error) => {
          console.error('Work Add Error:', error);
          // this.form.setErrors({ temp: true });
        }
      })
    }
  }

  showNotification(
    colorName: string,
    text: string,
  ) {
    this.snackBar.open(text, '', {
      duration: 3000,
      panelClass: colorName,
    });
  }

  protected onApprove() {
    this.workService.approve(this.work).subscribe((work: Work) => {
      this.showNotification('success', 'Aprovado com sucesso!');
      this.modal?.close(work);
      this.work = work;
    });
  }

  protected onReject() {
    this.workService.reject(this.work).subscribe((work: Work) => {
      this.showNotification('success', 'Reprovado com sucesso!');
      this.modal?.close(work);
      this.work = work;
    });
  }

  protected setModal($event: ModalComponent) {
    this.modal = $event;
  }

  onDeleteWork($event: boolean) {
    if ($event) {
      this.showNotification('success', 'Trabalho excluído com sucesso!');
      this.form.reset();
      this.closeRefresh();
    }
  }
}
