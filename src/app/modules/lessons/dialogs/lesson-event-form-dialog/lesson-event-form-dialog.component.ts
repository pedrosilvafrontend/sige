import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogClose, MatDialogActions, MatDialogTitle, MatDialogConfig,
} from '@angular/material/dialog';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
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
import { TranslateModule } from '@ngx-translate/core';
import { UserTable } from '../../../users/users.model';
import {
  LessonEventFormComponent
} from '@modules/lessons/form/lesson-event.form.component/lesson-event.form.component';
import {
  ActivityConfig, Frequency, GeneralEvent,
  LessonEvent, LessonEventExtra,
  LessonEventForm,
  LessonEventFormValue,
  Proof,
  School,
  SchoolClass, UniqueLessonEvent, Work,
} from '@models';
import { AuthService } from '@services';
import { Button } from '@ui/button/button';
import { ProofService } from '@core/services/proof.service';
import { ModalComponent, ModalDialogComponent } from '@ui/modal/modal.component';
import { LessonEventExtraService } from '@services/lesson-event-extra.service';
import { TestFormComponent } from '@modules/common/form/test-form/test.form';
import { JsonPipe, NgClass, NgStyle } from '@angular/common';
import { IProofForm } from '@form/proof.form';
import { MessageService } from '@services/message.service';
import { TextEditor } from '@ui/text-editor/text-editor';
import { IWorkForm } from '@form/work.form';
import { WorkService } from '@services/work.service';
import { WorkFormModal } from '@modules/works/modals/work-form-modal/work-form-modal';
import { take } from 'rxjs';
import { EventColors } from '@modules/modals/event-colors/event-colors';
import { ColorBy, newColorBy } from '@models/colors-by';
import { GeneralEventModal } from '@modules/modals/general-event-modal/general-event-modal';

export interface DialogData {
  item: LessonEvent;
  lessonId: number;
  timeScheduleId: number;
  date: string;
  action: string;
  colorBy?: ColorBy;
}

@Component({
  selector: 'app-lesson-event-form-dialog',
  templateUrl: './lesson-event-form-dialog.component.html',
  styleUrls: ['./lesson-event-form-dialog.component.scss'],
  standalone: true,
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
    TranslateModule,
    LessonEventFormComponent,
    Button,
    MatDialogActions,
    MatDialogTitle,
    ModalComponent,
    TestFormComponent,
    NgClass,
    TextEditor,
    WorkFormModal,
    EventColors,
    JsonPipe,
  ],
})
export class LessonEventFormDialogComponent implements OnInit {
  protected dialogData: DialogData = inject(MAT_DIALOG_DATA);
  public ref = inject(MatDialogRef<LessonEventFormDialogComponent>);
  private proofService = inject(ProofService);
  private workService = inject(WorkService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  private lessonEventExtraService = inject(LessonEventExtraService);
  private message = inject(MessageService);
  auth = this.authService.user$.value;
  closeRefresh = false;
  event!: LessonEvent;
  proof: Proof = new Proof();
  generalEvent!: GeneralEvent;
  extra: LessonEventExtra = new class implements LessonEventExtra {}
  action = 'edit';
  dialogTitle!: string;
  form!: UntypedFormGroup;
  proofForm!: FormGroup<IProofForm>;
  workForm!: FormGroup<IWorkForm>;
  extraForm: UntypedFormGroup = this.fb.group({
    id: [''],
    planning: ['', Validators.required],
  });
  url: string | null = null;
  classes: SchoolClass[] = [];
  teachers: UserTable[] = [];
  schools: School[] = [];
  readonly: boolean;
  disabled = false;
  activityStatusClass: any = Proof.statusClass;
  planningModalOptions: MatDialogConfig = {
    minWidth: '800px',
    maxWidth: '1400px',
    minHeight: '300px',
    disableClose: true
  };
  activities: Map<string, ActivityConfig> = new Map();
  colorBy: ColorBy;
  initialSelectedProofEvents: UniqueLessonEvent[] = [];

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

  constructor() {
    const { action, lessonId, timeScheduleId, date, colorBy } = this.dialogData || {}
    const work = new Work();
    this.readonly = action === 'view';
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
    const lessonId = this.dialogData.item?.lesson?.id || 0;
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

  workModalOpen(openFn: (data?: Work) => MatDialogRef<ModalDialogComponent, any>) {
    const ref = openFn?.(this.work);
    if (ref) {
      ref.afterClosed().pipe(take(1)).subscribe((data) => {
        if (data?.id) {
          this.closeRefresh = true;
          this.work = data;
        }
      })
    }
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

  eventsToMulticlassProofs(events: UniqueLessonEvent[]): Proof[] {
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
      } as Proof
    })
  }

  saveOrUpdateProof(data: Proof, callback?: () => void) {
    const isUpdate = !!data?.id;
    const isMulticlass = data?.type === 'MULTICLASS_TEST';
    const lessonId = this.dialogData.item?.lesson?.id || 0;
    if (!lessonId) {
      return;
    }
    const request$ = isUpdate ? this.proofService.update(data) : this.proofService.add(data);
    request$.subscribe({
      next: (response: any) => {
        this.message.success('Salvo com sucesso!');
        callback?.();
        this.closeRefresh = true;
        let proof: Proof;
        if (isMulticlass && Array.isArray(response)) {
          proof = response.find((p: Proof) => p.lessonId === lessonId);
        }
        else {
          proof = response;
        }
        this.proof = proof;
        this.proofForm.patchValue(proof);
      },
      error: (error) => {
        console.error('Proof Update Error:', error);
        this.form.setErrors({ temp: true });
      },
    });
  }

  saveProof(callback?: () => void, confirmModal?: ModalComponent) {
    if (this.proofForm.valid) {
      const formData = this.form.getRawValue() as LessonEventFormValue;
      const proof = this.proofForm.value;
      const isUpdate = !!proof?.id;
      const isMulticlass = proof?.type === 'MULTICLASS_TEST';
      const lessonId = this.dialogData.item?.lesson?.id || 0;
      if (!lessonId) {
        return;
      }
      if (proof?.score || isMulticlass) {
        const events = proof.events?.filter((e: UniqueLessonEvent) => e.selected) || [];
        const data: Proof = {
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
          curricularComponentId: proof.curricularComponentId || 0
        }

        // TODO: criar alerta de provas que vão ser excluídas
        // const proofKeeps = (events || []).map((e: UniqueLessonEvent) => e.proofId);
        const originalSelected = this.initialSelectedProofEvents.map((e) => e.proofId);
        // const originalSelected = (this.initialSelectedProofEvents || []).reduce((acc, e) => {
        //   if (e.proofType === 'MULTICLASS_TEST') {
        //     acc.push(e.proofId);
        //   }
        //   return acc;
        // }, [] as number[]);
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

        this.saveOrUpdateProof(data, callback);

        // const request$ = isUpdate ? this.proofService.update(data) : this.proofService.add(data);
        // request$.subscribe({
        //   next: (response: any) => {
        //     this.message.success('Salvo com sucesso!');
        //     callback?.();
        //     this.closeRefresh = true;
        //     let proof: Proof;
        //     if (isMulticlass && Array.isArray(response)) {
        //       proof = response.find((p: Proof) => p.lessonId === lessonId);
        //     }
        //     else {
        //       proof = response;
        //     }
        //     this.proof = proof;
        //     this.proofForm.patchValue(proof);
        //   },
        //   error: (error) => {
        //     console.error('Proof Update Error:', error);
        //     this.form.setErrors({ temp: true });
        //   },
        // });
      }

      if (this.action === 'edit') {
        // TODO: adicionar instrumentos avaliativos e observação

      }
    }
  }

  deleteAllProofs(callback?: () => void) {
    const proof = this.proofForm.value;
    if (proof.type === 'MULTICLASS_TEST') {
      this.proofForm.controls.events.clear();
      this.saveProof(callback);
    }
  }

  deleteProof(callback?: () => void) {
    const proof = this.proofForm.value;
    this.proofService.deleteItem(proof.id || 0).subscribe(() => {
      this.message.success('Prova excluída com sucesso!');
      this.proofForm.reset();
      Object.assign(this.event.evalTools.proof || {}, this.proofForm.value);
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

  ngOnInit() {
    if (this.dialogData.item) {
      this.event = this.dialogData.item;
      if (this.event?.evalTools?.proof?.id) {
        const proof = this.event.evalTools.proof;
        if (!this.proof.timeScheduleId) {
          this.proof.timeScheduleId = this.timeScheduleId;
        }
        this.proof = proof;
      }
      if (this.event?.evalTools?.work?.id) {
        this.work = this.event.evalTools.work;
      }
      if (this.event?.extra?.id) {
        this.extra = this.event.extra;
      }
      this.extraForm.patchValue(this.extra || {})
    }

  }
}
