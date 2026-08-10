import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogClose, MatDialogActions, MatDialogTitle, MatDialogConfig,
} from '@angular/material/dialog';
import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy,
  viewChild, effect
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup, UntypedFormGroup, FormBuilder, Validators,
} from '@angular/forms';
import {
  MatNativeDateModule,
  MatOptionModule,
} from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { UserTable } from '../../../users/users.model';
import {
  LessonEventFormComponent
} from '@modules/lessons/form/lesson-event.form.component/lesson-event.form.component';
import {
  ActivityConfig, Frequency, GeneralEvent,
  LessonEvent, LessonEventExtra,
  LessonEventForm,
  LessonEventFormValue,
  Test,
  School,
  SchoolClass, UniqueLessonEvent, Work, EventMerge,
} from '@models';
import { AuthService, ClassesService } from '@services';
import { Button } from '@ui/button/button';
import { TestService } from '@core/services/test.service';
import { ModalComponent, ModalDialogComponent } from '@ui/modal/modal.component';
import { LessonEventExtraService } from '@services/lesson-event-extra.service';
import { TestFormComponent } from '@modules/common/form/test-form/test.form';
import { ITestForm } from '@form/proof.form';
import { MessageService } from '@services/message.service';
import { TextEditor } from '@ui/text-editor/text-editor';
import { IWorkForm } from '@form/work.form';
import { WorkService } from '@services/work.service';
import { WorkFormModal } from '@modules/works/modals/work-form-modal/work-form-modal';
import { firstValueFrom, Subject, take } from 'rxjs';
import { EventColors } from '@modules/modals/event-colors/event-colors';
import { ColorBy, newColorBy } from '@models/colors-by';
import { LessonEventService } from '@services/lesson-event.service';
import { Router } from '@angular/router';
import { WorkFormComponent } from '@modules/common/form/work-form/work-form.component';
import { ActivityDuplicate } from '@ui/event-select-modal/activity-duplicate';
import { TestFormModal } from '@modules/works/modals/test-form-modal/test-form-modal';
import { BaseModal } from '@modules/modals/base-modal/base-modal';
import Swal from 'sweetalert2';

export interface DialogData {
  item: EventMerge;
  lessonId: number;
  timeScheduleId: number;
  date: string;
  action: string;
  colorBy?: ColorBy;
  classHash?: string;
}

@Component({
  selector: 'app-lesson-event-form-dialog',
  templateUrl: './lesson-event-form-dialog.component.html',
  styleUrls: ['./lesson-event-form-dialog.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDialogContent,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatDatepickerModule,
    MatSelectModule,
    MatOptionModule,
    MatDialogClose,
    MatNativeDateModule,
    TranslatePipe,
    LessonEventFormComponent,
    Button,
    MatDialogActions,
    MatDialogTitle,
    ModalComponent,
    TestFormComponent,
    TextEditor,
    WorkFormModal,
    EventColors,
    WorkFormComponent,
    TestFormModal,
  ],
})
export class LessonEventFormDialogComponent implements OnInit, OnDestroy {
  protected dialogData: DialogData = inject(MAT_DIALOG_DATA);
  public ref = inject(MatDialogRef<LessonEventFormDialogComponent>);
  private router = inject(Router);
  private testService = inject(TestService);
  private workService = inject(WorkService);
  private authService = inject(AuthService);
  private classService = inject(ClassesService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  private lessonEventService = inject(LessonEventService);
  private lessonEventExtraService = inject(LessonEventExtraService);
  private message = inject(MessageService);
  // private testDup!: ActivityDuplicate<Test>;
  private testModal = viewChild<BaseModal<Test>>('testModal');
  private workModal = viewChild<WorkFormModal>('workModal');

  // private _saveTestNextMode = false;
  // get saveTestNextMode(): boolean {
  //   return this._saveTestNextMode;
  // }
  // set saveTestNextMode(value: boolean) {
  //   this._saveTestNextMode = value;
  //   if (!value) {
  //     this.originalTest = new Test();
  //   }
  // }
  // testCompareModal = viewChild<ModalComponent>('testCompareModal');
  // testModal = viewChild<ModalComponent>('testModal');
  // eventSelectModal = viewChild<ModalComponent>('eventSelectModal');
  auth = this.authService.user$.value;
  readonly = !this.auth.id;
  closeRefresh = false;
  event = new LessonEvent();

  private _test: Test = new Test();
  set test(test: Test) {
    this._test = test;

    // if (!this.testDup) {
    //   this._test = test;
    //   return;
    // }
    // this.testDup.data = test;
  }
  get test() {
    return this._test;

    // if (!this.testDup) {
    //   return this._test;
    // }
    // return this.testDup.data;
  }

  generalEvent!: GeneralEvent;
  extra: LessonEventExtra = new class implements LessonEventExtra {}
  action = 'edit';
  dialogTitle!: string;
  form!: UntypedFormGroup;
  proofForm!: FormGroup<ITestForm>;
  workForm!: FormGroup<IWorkForm>;
  extraForm: UntypedFormGroup = this.fb.group({
    id: [''],
    planning: ['', Validators.required],
  });
  url: string | null = null;
  classes: SchoolClass[] = [];
  teachers: UserTable[] = [];
  schools: School[] = [];
  disabled = false;
  activityStatusClass: any = Test.statusClass;
  planningModalOptions: MatDialogConfig = {
    minWidth: '800px',
    maxWidth: '1400px',
    minHeight: '300px',
    disableClose: true
  };
  activities: Map<string, ActivityConfig> = new Map();
  colorBy: ColorBy = newColorBy();
  initialSelectedProofEvents: UniqueLessonEvent[] = [];
  lessonId = 0;
  classHash = '';
  private destroy$ = new Subject<void>();
  // originalTest: Test = new Test();
  // overrideTest: Test | null = null;

  // copyTest(test: Test, event?: LessonEvent) {
  //   return new Test({
  //     type: test.type,
  //     curricularComponent: event?.curricularComponent ?? test.curricularComponent,
  //     title: test.title,
  //     content: test.content,
  //     score: test.score,
  //     whereToFindIt: test.whereToFindIt,
  //     lessonId: event?.lesson?.id || 0,
  //     curricularComponentId: event?.curricularComponent?.id || 0,
  //     timeScheduleId: event?.frequency?.timeSchedule?.id || 0,
  //     date: event?.date || ''
  //   });
  // }

  async reset(event?: LessonEvent) {
    this.event = event || new LessonEvent();
    // this.overrideTest = this.copyTest(this.test, this.event);
    this.form.reset();
    this.dialogData.item = this.event;
    this.lessonId = this.event.lesson?.id || 0;

    this.dialogData = {
      item: this.event,
      lessonId: this.event.lesson?.id || 0,
      timeScheduleId: this.event.frequency?.timeSchedule?.id || 0,
      date: this.event.date,
      action: 'edit',
      colorBy: newColorBy(),
      classHash: ''
    }
    this.construct();
    await this.ngOnInit();
    this.cdr.detectChanges();
  }

  private _work!: Work;
  get work(): Work {
    return this._work;
  }
  set work(value: Work) {
    this._work = value;
  }

  get schoolId(): number {
    return this.event?.school?.id || 0;
  }

  get frequency(): Frequency {
    const frequency = this.event?.frequency || new Frequency();
    if (this.event.weekday) {
      frequency.weekday = this.event.weekday;
    }
    return frequency;
  }

  get timeScheduleId(): number {
    return this.event?.frequency?.timeSchedule?.id || 0;
  }

  setReadonly(isReadonly: boolean) {
    this.readonly = !this.auth.id || isReadonly;
  }

  constructor() {
    this.construct();

    // effect(() => {
    //   const testModal = this.testModal();
    //   const eventSelectModal = this.eventSelectModal();
    //   if (!this.testDup && testModal && eventSelectModal) {
    //     this.testDup = new ActivityDuplicate<Test>(Test, testModal, eventSelectModal);
    //   }
    // });

    // effect(() => {
    //   const workModal = this.workModal();
    //   const eventSelectModal = this.eventSelectModal();
    //   if (!this.workDup && workModal && eventSelectModal) {
    //     this.workDup = new ActivityDuplicate<Test>(Test, workModal, eventSelectModal);
    //   }
    // });
  }

  construct() {
    const { item, action, lessonId, timeScheduleId, date, colorBy, classHash } = this.dialogData || {};
    this.classHash = classHash || '';
    this.lessonId = item.lessonId || item.lesson?.id || 0;
    const work = new Work();
    this.setReadonly(action === 'view');
    if (lessonId) {
      work.lessonId = lessonId;
    }
    if (timeScheduleId) {
      work.timeScheduleId = timeScheduleId;
    }
    if (date) {
      work.date = date;
    }

    this.work = work;

    this.colorBy = colorBy || newColorBy();
  }

  savePlanning(callback?: () => void) {
    const lessonId = this.lessonId;
    if (!lessonId || this.extraForm.invalid) {
      return;
    }
    const { date, timeSchedule } = this.form.getRawValue() as LessonEventFormValue;
    const { id, planning } = this.extraForm.value;
    const data: LessonEventExtra = {
      id: id || 0,
      lessonId,
      timeScheduleId: timeSchedule.id,
      date,
      planning
    }
    this.lessonEventExtraService.params({ lessonId }).add(data).subscribe((response: LessonEventExtra) => {
      this.message.success('Salvo com sucesso!');
      this.extra = response;
      this.closeRefresh = true;
      callback?.();
    })
  }

  openColorModal(modal: EventColors) {
    modal.open(this.event).afterClosed().pipe(take(1)).subscribe((colorBy) => {
      if (colorBy) {
        this.colorBy = colorBy;
        this.closeRefresh = true;
      }
    })
  }

  workModalOpen() {
    const ref = this.workModal()?.open(this.work);
    if (ref) {
      ref.afterClosed().pipe(take(1)).subscribe((res: any) => {
        if (res?.data?.id) {
          this.closeRefresh = true;
          this.work = res.data;
          // this.saveWorkNextMode = true;
        } else {
          // this.saveWorkNextMode = false;
        }
        if (res.goNext) {
          this.closeRefresh = true;
          this.openEventSelect();
          // this.testDup.openEventSelect();
        }
      })
    }
  }

  openEventSelect() {
    // TODO: continuar
  }

  gEventOpen(openFn: (data?: GeneralEvent) => MatDialogRef<ModalDialogComponent, GeneralEvent>) {
    const ref = openFn?.(this.generalEvent);
    if (ref) {
      ref.afterClosed().pipe(take(1)).subscribe((data) => {
        if (data?.id) {
          this.closeRefresh = true;
          this.generalEvent = data;
        }
      })
    }
  }

  eventsToMulticlassProofs(events: UniqueLessonEvent[]): Test[] {
    return (events || []).map(e => {
      return {
        id: 0,
        type: 'MULTICLASS_TEST',
        schoolId: e.schoolId,
        lessonId: e.lessonId,
        timeScheduleId: e.timeScheduleId,
        date: e.date,
        content: '',
        score: '',
        status: '',
      } as Test
    })
  }

  saveOrUpdateProof(data: Test, callback?: (success: boolean) => void) {
    const isUpdate = !!data?.id;
    const isMulticlass = data?.type === 'MULTICLASS_TEST';
    const lessonId = this.lessonId;
    if (!lessonId) {
      return;
    }
    const request$ = isUpdate ? this.testService.update(data) : this.testService.add(data);
    request$.subscribe({
      next: (response: any) => {
        this.message.success('Salvo com sucesso!');
        callback?.(true);
        this.closeRefresh = true;
        let test: Test;
        if (isMulticlass && Array.isArray(response)) {
          test = response.find((p: Test) => p.lessonId === lessonId);
        }
        else {
          test = response;
        }
        this.test = test;
        this.proofForm.patchValue(test);
      },
      error: (error) => {
        callback?.(false);
        console.error('Proof Update Error:', error);
        this.form.setErrors({ temp: true });
      },
    });
  }

  saveTest(proofModal: ModalComponent, deleteProofOnUpdateModal: ModalComponent) {
    // this.saveTestNextMode = false;
    this.saveProof((success: boolean) => {
      if (success) {
        proofModal.close(true);
      }
    }, deleteProofOnUpdateModal)
  }

  saveProof(callback?: (success: boolean) => void, confirmModal?: ModalComponent) {
    if (this.proofForm.valid) {
      const formData = this.form.getRawValue() as LessonEventFormValue;
      const proof = this.proofForm.getRawValue();
      const isUpdate = !!proof?.id;
      const isMulticlass = proof?.type === 'MULTICLASS_TEST';
      const lessonId = this.lessonId;
      // const ccId = this.dialogData.item?.curricularComponent?.id || 0;
      if (!lessonId) {
        return;
      }
      if (proof?.score || isMulticlass) {
        // const events = proof.events?.filter((e: UniqueLessonEvent) => e.selected) || [];
        const events = proof.events;
        const data: Test = {
          id: proof.id || 0,
          type: proof.type || 'TEST',
          lessonId: lessonId,
          schoolId: proof.schoolId || this.schoolId,
          content: proof.content || '',
          date: formData.date,
          score: proof.score || '',
          status: proof.status || '',
          timeScheduleId: formData.timeSchedule?.id || 0,
          title: proof.title || '',
          whereToFindIt: proof.whereToFindIt || '',
          events: events,
          curricularComponentId: proof.curricularComponent?.id || 0
        }

        // alerta de provas a serem excluídas
        const originalSelected = this.initialSelectedProofEvents.map((e) => e.proofId);
        const proofExcludes = isUpdate ? proof.events?.filter((e) => !e.selected && originalSelected.includes(e.proofId)) || [] : [];
        const hasExcludes = proofExcludes.length > 0;
        if (hasExcludes) {
          const modalRef = confirmModal?.open({ events: proofExcludes });
          modalRef?.afterClosed().pipe(take(1))
            .subscribe((confirmed: boolean) => {
              if (confirmed) {
                this.saveOrUpdateProof(data, callback);
              }
            });
          return;
        }
      }
    }
  }

  // openEventSelect = () => {};
  //
  // setEventSelect(eventSelectModal: EventSelectModal) {
  //   this.openEventSelect = () => {
  //     eventSelectModal.open().then((ref) => {
  //       ref?.afterClosed().pipe(takeUntil(this.destroy$))
  //         .subscribe((value: any) => {
  //           if (!value) {
  //             this.testNextMode(false);
  //           }
  //         });
  //     });
  //   }
  // }

  // saveTestNext(testModal: ModalComponent) {
  //   this.testNextMode(true);
  //   this.saveProof((success: boolean) => {
  //     if (success) {
  //       testModal.close(true);
  //       // this.openEventSelect();
  //       this.testDup.openEventSelect();
  //     } else {
  //       this.testNextMode(false);
  //     }
  //   })
  // }

  deleteAllProofs(callback?: () => void) {
    const proof = this.proofForm.value;
    if (proof.type === 'MULTICLASS_TEST') {
      this.testService.deleteAll(proof.id || 0).subscribe(() => {
        this.message.success('Provas excluídas com sucesso!');
        this.proofForm.reset();
        Object.assign(this.event.evalTools.test || {}, this.proofForm.value);
        this.closeRefresh = true;
        callback?.();
      })
    }
  }

  deleteProof(callback?: () => void) {
    const proof = this.proofForm.value;
    this.testService.deleteItem(proof.id || 0).subscribe(() => {
      this.message.success('Prova excluída com sucesso!');
      this.proofForm.reset();
      Object.assign(this.event.evalTools.test || {}, this.proofForm.value);
      this.closeRefresh = true;
      callback?.();
    })
  }

  deleteWork(callback?: () => void) {
    const work = this.workForm.value;
    this.workService.deleteItem(work.id || 0).subscribe(() => {
      this.message.success('Trabalho excluído com sucesso!');
      this.workForm.reset();
      Object.assign(this.event.evalTools.work || {}, this.workForm.value);
      this.closeRefresh = true;
      callback?.();
    })
  }

  setForm(form: FormGroup<LessonEventForm>) {
    this.form = form;
    this.cdr.detectChanges();
  }

  close() {
    this.ref.close(this.closeRefresh);
  }

  async getEvents(params: any) {
    const request$ = params.classHash
      ? this.lessonEventService.getPublicAll(params)
      : this.lessonEventService.getAll(params);
    return await firstValueFrom(request$);
  }

  async ngOnInit() {
    if (this.dialogData.item) {
      const item = this.dialogData.item;
      const classHash = this.classHash || '';
      let event = new LessonEvent();
      if (item.lessonId) {
        const {schoolId, lessonId, classId, timeScheduleId, date} = item;
        const params: any = {
          schoolId,
          lessonId,
          classId,
          timeScheduleId,
          date,
        };
        if (classHash) {
          params.classHash = classHash;
        }
        const events = await this.getEvents(params);

        if (events.length == 1) {
          event = events[0];
        }
      } else if (item.lesson?.id) {
        event = item as LessonEvent;
      }

      // this.event = this.dialogData.item;
      this.event = event;
      if (this.event?.evalTools?.test?.id) {
        const proof = this.event.evalTools.test;
        if (!this.test.timeScheduleId) {
          this.test.timeScheduleId = this.timeScheduleId;
        }
        this.test = proof;
      }
      if (this.event?.evalTools?.work?.id) {
        this.work = this.event.evalTools.work;
      }
      if (this.event?.extra?.id) {
        this.extra = this.event.extra;
      }
      this.extraForm.patchValue(this.extra || {})
      this.cdr.detectChanges();
    }

  }

  protected readonly ProofService = TestService;

  protected async openTestModal(overrideTest?: Partial<Test> | null) {



  //   let codePrefix = this.dialogData.item.schoolClass?.codePrefix || '';
    const schoolClass = this.dialogData.item.schoolClass;
    const classCode = schoolClass?.code || '';
    const testContext: any = {
      classHash: this.classHash,
      overrideTest,
      hasNext: true
    };

  //   if (!this.router.url.includes('/public/')) {
  //     if (!codePrefix && classCode) {
  //       codePrefix = classCode.match(/^[A-Za-z]+\d+/)?.[0] || '';
  //     }
  //     const resp = await firstValueFrom(this.classService.getAll({codePrefix}));
  //     const classes = (resp.data || []).sort((a, b) => {
  //       if (a.code === classCode) return -1;
  //       if (b.code === classCode) return 1;
  //       return a.code && b.code ? a.code.localeCompare(b.code) : 0;
  //     });
  //     if (classes.length > 1) {
  //       testContext.hasNext = true;
  //     }
  //   }
  //   await this.testDup.openModal(testContext);
  //   // proofModal.open(testContext).afterClosed().pipe(take(1)).subscribe((resp: any) => {
  //   //   if (!resp && this.saveTestNextMode) {
  //   //     this.openEventSelect();
  //   //   }
  //   // });

    this.testModal()?.open(null, testContext);
  }
  // async onSelectEvent(event: LessonEvent, testModal: ModalComponent) {
  //   const originalTest = event.evalTools.test;
  //   if (originalTest?.type === 'MULTICLASS_TEST') {
  //     await Swal.fire({
  //       title: 'Prova bimestral',
  //       text: 'Não é possível duplicar para prova bimestral',
  //       icon: 'warning',
  //       confirmButtonText: 'OK',
  //     });
  //     return;
  //   }
  //   if (originalTest?.id) {
  //     this.originalTest = originalTest;
  //     const ref = this.testCompareModal()?.open();
  //     ref?.afterClosed().pipe(take(1)).subscribe((resp: any) => {
  //
  //       if (!resp) {
  //         this.originalTest = new Test();
  //         this.overrideTest = null;
  //       }
  //       if (resp === true || resp === false) {
  //         if (resp) {
  //           this.originalTest = originalTest;
  //           this.overrideTest = Object.assign({}, this.test, { id: 0 });
  //         } else {
  //           this.overrideTest = null;
  //         }
  //
  //         this.openTestModal(testModal, this.overrideTest).then();
  //       }
  //       this.reset(event).then();
  //     });
  //     return;
  //   }
  //   this.reset(event).then();
  //   this.openTestModal().then();
  // }

  // confirmOverrideTest(confirm: boolean) {
  //   if (!confirm) {
  //     this.testDup.target = new Test();
  //     this.testDup.overrideData = null;
  //     // this.originalTest = new Test();
  //     // this.overrideTest = null;
  //   }
  //   this.testCompareModal()?.close(confirm);
  // }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
