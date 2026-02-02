import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogClose, MatDialogActions, MatDialogTitle,
} from '@angular/material/dialog';
import { ChangeDetectorRef, Component, inject, OnInit, output } from '@angular/core';
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
  LessonBatch,
  LessonEvent, LessonEventExtra,
  LessonEventForm,
  LessonEventFormValue,
  Proof,
  School,
  SchoolClass,
  Work
} from '@models';
import { AuthService, LessonStateService } from '@services';
import { Button } from '@ui/button/button';
import { LessonEventService } from '@services/lesson-event.service';
import { ProofService } from '@core/services/proof.service';
import { Util } from '@util/util';
import { takeUntil } from 'rxjs';
import { UpdateService } from '@services/update.service';
import { ModalComponent } from '@ui/modal/modal.component';
import { Textarea } from '@ui/field/textarea/textarea';
import { LessonEventExtraService } from '@services/lesson-event-extra.service';
import { TestFormComponent } from '@modules/common/form/test-form/test.form';
import { JsonPipe, NgClass } from '@angular/common';
import { IProofForm } from '@form/proof.form';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessageService } from '@services/message.service';

export interface DialogData {
  item: LessonEvent;
  action: string;
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
    Textarea,
    TestFormComponent,
    NgClass,
  ],
})
export class LessonEventFormDialogComponent implements OnInit {
  protected dialogData: DialogData = inject(MAT_DIALOG_DATA);
  public ref = inject(MatDialogRef<LessonEventFormDialogComponent>);
  private lessonState = inject(LessonStateService);
  private proofService = inject(ProofService);
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private updateService = inject(UpdateService);
  private fb = inject(FormBuilder);
  private lessonEventExtraService = inject(LessonEventExtraService);
  private message = inject(MessageService);

  public user = this.auth.user$.value;
  public closeRefresh = false;
  public event!: LessonEvent;
  public proof: Proof = new Proof();
  public extra: LessonEventExtra = new class implements LessonEventExtra {}
  public action = 'edit';
  public dialogTitle!: string;
  public form!: UntypedFormGroup;
  public proofForm!: FormGroup<IProofForm>;
  public extraForm: UntypedFormGroup = this.fb.group({
    id: [''],
    planning: ['', Validators.required],
  });
  public url: string | null = null;
  public classes: SchoolClass[] = [];
  public teachers: UserTable[] = [];
  public schools: School[] = [];
  public readonly: boolean;
  public schoolId: number = 0;
  public disabled = false;
  public proofStatusClass: any = Proof.statusClass;

  constructor() {
    this.readonly = this.dialogData.action === 'view';
    // const lessonBatch = this.lessonSignal();
    // if (lessonBatch) {
    //   this.lessonBatch = lessonBatch;
    // }

    // console.log('Lesson Event Form Dialog Component', this.lesson);
    // this.action = this.lesson?.id;
    // if (this.action === 'edit') {
    //   this.dialogTitle = dialogData.table.curricularComponent?.name || '';
    //   this.data = dialogData.table;
    // } else {
    //   this.dialogTitle = 'New record';
    //   this.data = new Lesson();
    // }
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
      // this.form.patchValue(response);
      this.closeRefresh = true;
      callback?.();
    })
  }

  saveProof(callback?: () => void) {
    if (this.proofForm.valid) {
      const formData = this.form.getRawValue() as LessonEventFormValue;
      const proof = this.proofForm.value;
      const lessonId = this.dialogData.item?.lesson?.id || 0;
      if (!lessonId) {
        return;
      }
      if (proof?.score) {
        const data: Proof = {
          content: proof.content || '',
          date: formData.date,
          id: proof.id || 0,
          lessonId: lessonId,
          score: proof.score,
          status: proof.status || '',
          timeScheduleId: formData.timeSchedule?.id || 0,
          title: proof.title || '',
          whereToFindIt: proof.whereToFindIt || '',
        }
        const request$ = data.id ? this.proofService.update(data) : this.proofService.add(data);
        request$.subscribe({
          next: (response) => {
            this.message.success('Salvo com sucesso!');
            callback?.();
            this.closeRefresh = true;
            this.proofForm.patchValue(response);
            this.proof = response;
            // Object.assign(this.proof, response);
            // this.ref.close(response);
          },
          error: (error) => {
            console.error('Proof Update Error:', error);
            this.form.setErrors({ temp: true });
          },
        });
      }

      if (this.action === 'edit') {
        // TODO: adicionar instrumentos avaliativos e observação

      }
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
      // this.ref.close(proof);
    })
  }

  setForm(form: FormGroup<LessonEventForm>) {
    this.form = form;
    this.cdr.detectChanges();
    // const lesson = (this.dialogData?.lesEvent || {});
    // this.form.patchValue(lesson as any);
  }

  close() {
    this.ref.close(this.closeRefresh);
  }

  ngOnInit() {
    if (this.dialogData.item) {
      this.event = this.dialogData.item;
      if (this.event?.evalTools?.proof) {
        this.proof = this.event.evalTools.proof;
      }
      if (this.event?.extra) {
        this.extra = this.event.extra;
      }
      this.extraForm.patchValue(this.extra || {})
    }

  }
}
