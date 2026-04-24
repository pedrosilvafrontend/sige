import { Component, effect, inject, input } from '@angular/core';
import { Button } from '@ui/button/button';
import { EventCard } from '@ui/event-card/event-card';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MatDialogActions,
  MatDialogConfig,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';
import { ModalComponent, ModalDialogComponent } from '@ui/modal/modal.component';
import { ActivityConfig, LessonEvent } from '@models';
import { AuthService } from '@services';
import { take } from 'rxjs';
import { ColorBy, newColorBy } from '@models/colors-by';
import { UserColorsService } from '@core/services/user-colors.service';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';

@Component({
  selector: 'app-event-colors',
  imports: [
    Button,
    EventCard,
    FormsModule,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    MatFormField,
    MatInput,
    MatLabel,
    TranslatePipe,
    ModalComponent,
    ReactiveFormsModule,
    MatRadioButton,
    MatRadioGroup,
  ],
  templateUrl: './event-colors.html',
  styleUrl: './event-colors.scss',
})
export class EventColors {
  private authService = inject(AuthService);
  private userColorsService = inject(UserColorsService);
  auth = this.authService.user$.value;
  fb = inject(FormBuilder);
  eventInput = input.required<LessonEvent>({ alias: 'event' });
  colorBy = input<ColorBy>(newColorBy());
  event!: LessonEvent;
  activities: Map<string, ActivityConfig> = new Map();
  form = (() => {
    let coloringBy = 'school';
    if (this.auth.role == 'teacher') {
      coloringBy = 'class';
    }
    if (this.auth.role == 'coordinator') {
      coloringBy = 'curricularComponent';
    }
    return this.fb.nonNullable.group({
      id: [0],
      userId: [this.auth.id],
      schoolId: [0],
      classId: [0],
      curricularComponentId: [0],
      color: ['#ffffff', [Validators.required]],
      coloringBy: [coloringBy, [Validators.required]],
    });
  })()
  ref!: MatDialogRef<ModalDialogComponent, ColorBy>;
  modal!: ModalComponent;
  options: MatDialogConfig<{colorBy?: ColorBy}> = {
    disableClose: true,
    minWidth: '600px',
  };
  submitting = false;
  private _schoolId = 0;
  get schoolId() {
    return this._schoolId;
  }
  set schoolId(value: number) {
    this._schoolId = value;
    this.form.patchValue({ schoolId: value || 0 });
  }

  constructor() {
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.closeRefresh = this.closeRefresh.bind(this);

    effect(() => {
      if(this.eventInput()) {
        this.event = this.eventInput();
        this.onEventInput(this.event);
      }
      this.schoolId = this.authService.school()?.id || 0;

      const colorBy = this.colorBy();
      if (colorBy && colorBy.id) {
        this.form.reset(colorBy as any, { emitEvent: false })
      }
    });
  }

  onEventInput(event: LessonEvent) {
    this.form.patchValue({
      classId: event.schoolClass.id || 0,
      curricularComponentId: event.curricularComponent?.id || 0,
      color: event.color || '#ffffff'
    }, { emitEvent: false })
  }

  open(event?: LessonEvent) {
    this.event = {
      ...this.eventInput(),
      ...(event || {})
    }
    this.ref = this.modal?.open();
    this.ref?.afterClosed().pipe(take(1)).subscribe((response) => {
      if (response) {
        this.form.reset(response as any);
      }
    });
    return this.ref;
  }

  close(result?: ColorBy) {
    this.modal?.close(result);
  }

  closeRefresh() {
    this.modal?.close(this.event);
  }

  protected setModal($event: ModalComponent) {
    this.modal = $event;
  }

  submit() {
    if (this.form.invalid) {
      return;
    }
    this.submitting = true;
    const data = this.form.getRawValue();
    const request$ = (
      data.id ? this.userColorsService.update : this.userColorsService.add
    ).bind(this.userColorsService);
    request$(data as any).pipe(take(1)).subscribe({
      next: (colorBy) => {
        this.submitting = false;
        this.close(colorBy);
      },
      error: (err) => {
        console.error('Error adding event color', err);
      },
      complete: () => {
        console.log('Event color added successfully');
        this.submitting = false;
      },
    });
  }

}
