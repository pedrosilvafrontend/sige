import { ChangeDetectorRef, Component, effect, inject, input, OnDestroy, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { firstValueFrom, startWith, Subject, takeUntil } from 'rxjs';
import { ActivityConfig, LessonEvent, Proof } from '@models';
import { DatePipe } from '@angular/common';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { User } from '@core/models/interface';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  LessonEventFormDialogComponent
} from '@modules/lessons/dialogs/lesson-event-form-dialog/lesson-event-form-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LessonEventService } from '@services/lesson-event.service';
import { UpdateService } from '@services/update.service';
import { ActivityService } from '@modules/config/activity/activity.service';
import { EventCard } from '@ui/event-card/event-card';
import { Skeleton } from '@ui/skeleton/skeleton';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { UserColorsService } from '@core/services/user-colors.service';
import { ColorsBy, newColorsBy, ColorsMap, ColoringBy } from '@models/colors-by';
import { ColoringByPipe, getColorBy } from '@util/coloring-by-pipe';

@Component({
  selector: 'app-main-dashboard',
  standalone: true,
  imports: [
    MatCardModule,
    TranslateModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    EventCard,
    Skeleton,
    Skeleton,
    MatRadioButton,
    MatRadioGroup,
    ColoringByPipe
  ],
  providers: [
    TranslatePipe
  ],
  templateUrl: './main-dashboard.component.html',
  styleUrl: './main-dashboard.component.scss'
})
export class MainDashboardComponent implements OnInit, OnDestroy {
  private lessonEventService = inject(LessonEventService);
  private userColorsService = inject(UserColorsService);
  private cdr = inject(ChangeDetectorRef);
  private dialog = inject(MatDialog);
  private translatePipe = inject(TranslatePipe);
  private snack = inject(MatSnackBar);
  private updateService = inject(UpdateService);
  private activityService = inject(ActivityService);
  private destroy$: Subject<void> = new Subject<void>();
  auth = input.required<User>();
  events: LessonEvent[] = [];
  dateFormat = 'dd/MM/yyyy';
  proofStatusClass: any = Proof.statusClass;
  activities: Map<string, ActivityConfig> = new Map();
  isLoading = signal(true);
  coloringByControl = new FormControl<"school" | "class" | "curricularComponent" | null>(null);
  colors = newColorsBy();

  constructor() {
    effect(() => {
      if(!this.coloringByControl.value) {
        let coloringBy: ColoringBy = null;
        const role = this.auth()?.role || '';
        if (role == 'teacher') {
          coloringBy = 'class';
        }
        if (role == 'coordinator') {
          coloringBy = 'curricularComponent';
        }
        this.coloringByControl.setValue(coloringBy, { emitEvent: false });
      }
    });
  }

  async ngOnInit() {
    // await this.getEvents();

    this.updateService.proof$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.getEvents().then();
    });

    this.activities = await this.activityService.getMap();
    this.isLoading.set(false);

    this.coloringByControl.valueChanges
      .pipe(takeUntil(this.destroy$), startWith(this.coloringByControl.value))
      .subscribe(() => {
        this.refresh();
      });
  }

  async refresh() {
    await this.getColors();
    await this.getEvents();
    this.cdr.detectChanges();
  }

  async getEvents() {
    // this.isLoading.set(true);
    const params = {
      limit: this.auth().role === 'teacher' ? 36 : 24,
      prevDate: false,
    }
    this.events = await firstValueFrom(this.lessonEventService.getAll(params));
    // this.isLoading.set(false);
    this.cdr.detectChanges();
  }


  async getColors() {
    const coloringBy = this.coloringByControl.value as "school" | "class" | "curricularComponent" | null;
    // this.isLoading.set(true);
    const params = { coloringBy }
    const colors = await firstValueFrom<ColorsMap>(this.userColorsService.getMap(params));
    switch (coloringBy) {
      case 'school':
        this.colors.school = colors;
        break;
      case 'class':
        this.colors.class = colors;
        break;
      case 'curricularComponent':
        this.colors.curricularComponent = colors;
        break;
    }
    // this.isLoading.set(false);
    this.cdr.detectChanges();
  }

  openLessonEventDialog(event: LessonEvent) {
    const coloringBy = this.coloringByControl.value;
    const colorBy = getColorBy(this.colors, event, coloringBy);
    const dialogRef = this.dialog.open(LessonEventFormDialogComponent, {
      data: {
        item: event,
        lessonId: event.lesson?.id,
        timeScheduleId: event.frequency?.timeSchedule?.id || 0,
        date: event.date,
        action: 'edit',
        colorBy: colorBy,
      },
      autoFocus: false,
      disableClose: true,
      width: '800px',
      maxWidth: '100vw',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refresh().then();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
