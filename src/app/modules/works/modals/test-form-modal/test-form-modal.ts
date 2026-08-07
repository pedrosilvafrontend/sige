import { Component, inject, input, model, OnInit, viewChild } from '@angular/core';
import { BaseModal } from '@modules/modals/base-modal/base-modal';
import { LessonEvent, LessonEventFormValue, Test, UniqueLessonEvent } from '@models';
import { Button } from '@ui/button/button';
import { DatePipe, NgClass, SlicePipe } from '@angular/common';
import { MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { TestFormComponent } from '@modules/common/form/test-form/test.form';
import { TranslatePipe } from '@ngx-translate/core';
import { ModalComponent } from '@ui/modal/modal.component';
import { FormGroup } from '@angular/forms';
import { ITestForm } from '@form/proof.form';
import { TestCompareModal } from '@ui/test-compare-modal/test-compare-modal';
import { EventSelectModal } from '@ui/event-select-modal/event-select-modal';
import { ActivityDuplicate } from '@ui/event-select-modal/activity-duplicate';
import { TestDeleteModal, TestDeleteResponse } from '@modules/works/modals/test-delete-modal/test-delete-modal';
import { firstValueFrom, take, takeUntil } from 'rxjs';
import { TestService } from '@core/services/test.service';
import { MessageService } from '@services/message.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { ClassesService } from '@services';

@Component({
  selector: 'app-test-form-modal',
  imports: [
    Button,
    DatePipe,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    MatIcon,
    MatIconButton,
    SlicePipe,
    TestFormComponent,
    TranslatePipe,
    ModalComponent,
    NgClass,
    TestCompareModal,
    EventSelectModal,
    TestDeleteModal
  ],
  templateUrl: './test-form-modal.html',
  styleUrl: './test-form-modal.scss',
})
export class TestFormModal extends BaseModal<Test> implements OnInit {
  private testService = inject(TestService);
  private message = inject(MessageService);
  private router = inject(Router);
  private classService = inject(ClassesService);
  event = model.required<LessonEvent>();
  testForm!: FormGroup<ITestForm>;
  readonly = input(false);
  classHash = input('');
  override modal = viewChild<ModalComponent>('modal');
  testCompareModal = viewChild<ModalComponent>('testCompareModal');
  eventSelectModal = viewChild<ModalComponent>('eventSelectModal');
  deleteModal = viewChild<ModalComponent<TestDeleteResponse>>('deleteModal');
  dup = new ActivityDuplicate<Test>(Test, this.modal, this.eventSelectModal, this.testCompareModal);
  activityStatusClass: any = Test.statusClass;
  initialSelectedEvents: UniqueLessonEvent[] = [];

  set test(test: Test) {
    this.dup.data = test;
  }
  get test() {
    return this.dup.data;
  }

  constructor() {
    super();
    this.data.set(new Test());
  }

  openDeleteModal(): void {
    this.deleteModal()?.open();
  }

  saveTest(proofModal: ModalComponent, deleteProofOnUpdateModal: ModalComponent) {
    this.dup.nextMode = false;
    this._saveTest((success: boolean) => {
      if (success) {
        proofModal.close(true);
      }
    }, deleteProofOnUpdateModal)
  }

  private _saveTest(callback?: (success: boolean) => void, confirmModal?: ModalComponent) {
    if (this.form.valid) {
      // const formData = this.form.getRawValue() as LessonEventFormValue;
      const test = this.form.getRawValue();
      const isUpdate = !!test?.id;
      const isMulticlass = test?.type === 'MULTICLASS_TEST';
      const event = this.event();
      const lessonId = event?.lesson?.id;
      if (!lessonId) {
        return;
      }
      if (test?.score || isMulticlass) {
        const events = test.events;
        const data: Test = {
          id: test.id || 0,
          type: test.type || 'TEST',
          lessonId: lessonId,
          schoolId: test.schoolId || event.school.id || 0,
          content: test.content || '',
          date: event.date,
          score: test.score || '',
          status: test.status || '',
          timeScheduleId: event.frequency.timeSchedule?.id || 0,
          title: test.title || '',
          whereToFindIt: test.whereToFindIt || '',
          events: events,
          curricularComponentId: test.curricularComponent?.id || 0
        }

        // alerta de provas a serem excluídas
        const originalSelected = this.initialSelectedEvents.map((e) => e.proofId);
        const proofExcludes = isUpdate ? test.events?.filter((e: any) => !e.selected && originalSelected.includes(e.proofId)) || [] : [];
        const hasExcludes = proofExcludes.length > 0;
        if (hasExcludes) {
          const modalRef = confirmModal?.open({ events: proofExcludes });
          modalRef?.afterClosed().pipe(take(1))
            .subscribe((confirmed: boolean) => {
              if (confirmed) {
                this.saveOrUpdate(data, callback);
              }
            });
          return;
        }

        this.saveOrUpdate(data, callback);

      }

    }
  }

  async saveOrUpdate(data: Test, callback?: (success: boolean) => void) {
    const isUpdate = !!data?.id;
    const isMulticlass = data?.type === 'MULTICLASS_TEST';
    const event = this.event();
    const lessonId = event?.lesson?.id;
    if (!lessonId) {
      return;
    }
    const request$ = isUpdate ? this.testService.update(data) : this.testService.add(data);
    const response: any = await firstValueFrom(request$);
    if (response?.id || response?.length) {
      this.message.success('Salvo com sucesso!');
      callback?.(true);
      this.modal()?.close({ refresh: true });
      let test: Test;
      if (isMulticlass && Array.isArray(response)) {
        test = response.find((p: Test) => p.lessonId === lessonId);
      }
      else {
        test = response;
      }
      this.test = test;
      this.form.patchValue(test);
    }

    // request$.subscribe({
    //   next: (response: any) => {
    //
    //   },
    //   error: (error) => {
    //     callback?.(false);
    //     console.error('Proof Update Error:', error);
    //     this.form.setErrors({ temp: true });
    //   },
    // });
  }

  saveAndNext(testModal: ModalComponent) {
    this.dup.nextMode = true;
    this._saveTest((success: boolean) => {
      if (success) {
        testModal.close(true);
        this.dup.openEventSelect();
      } else {
        this.dup.nextMode = false;
      }
    })
  }

  confirmOverrideTest(confirm: boolean) {
    if (!confirm) {
      this.dup.target = new Test();
      this.dup.overrideData = null;
    }
    this.testCompareModal()?.close(confirm);
  }

  async selectEvent(event: LessonEvent) {
    const originalTest = event.evalTools.test;
    if (originalTest?.type === 'MULTICLASS_TEST') {
      await Swal.fire({
        title: 'Prova bimestral',
        text: 'Não é possível duplicar para prova bimestral',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }
    if (originalTest?.id) {
      this.dup.target = originalTest;
      const ref = this.testCompareModal()?.open();
      ref?.afterClosed().pipe(take(1)).subscribe((resp: any) => {

        if (!resp) {
          this.dup.target = new Test();
          this.dup.overrideData = null;
        }
        if (resp === true || resp === false) {
          if (resp) {
            this.dup.target = originalTest;
            this.dup.overrideData = Object.assign({}, this.test);
          } else {
            this.dup.overrideData = null;
          }

          this.openTestModal(this.dup.overrideData).then();
        }
        this.reset(event).then();
      });
      return;
    }
    this.reset(event).then();
    this.openTestModal().then();
  }

  protected async openTestModal(overrideTest?: Partial<Test> | null) {
    const schoolClass = this.event().schoolClass;
    let codePrefix = schoolClass?.codePrefix || '';
    const classCode = schoolClass?.code || '';
    const testContext: any = {
      classHash: this.classHash(),
      overrideTest
    };

    if (!this.router.url.includes('/public/')) {
      if (!codePrefix && classCode) {
        codePrefix = classCode.match(/^[A-Za-z]+\d+/)?.[0] || '';
      }
      const resp = await firstValueFrom(this.classService.getAll({codePrefix}));
      const classes = (resp.data || []).sort((a, b) => {
        if (a.code === classCode) return -1;
        if (b.code === classCode) return 1;
        return a.code && b.code ? a.code.localeCompare(b.code) : 0;
      });
      if (classes.length > 1) {
        testContext.hasNext = true;
      }
    }
    await this.dup.openModal(testContext);
    // proofModal.open(testContext).afterClosed().pipe(take(1)).subscribe((resp: any) => {
    //   if (!resp && this.saveTestNextMode) {
    //     this.openEventSelect();
    //   }
    // });
  }

  async reset(event?: LessonEvent) {
    this.event.set(event || new LessonEvent());
    this.form.reset();
  }

  ngOnInit() {
    this.deleteModal()?.ref.afterClosed()?.pipe(takeUntil(this.destroy$)).subscribe((res: TestDeleteResponse) => {
      if (res.success) {
        console.log('Successfully deleted test, refresh:', res.refresh);
      }
    })
  }
}
