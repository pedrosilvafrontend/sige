import { ChangeDetectorRef, Component, inject, input, OnDestroy, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { ActivityConfig, LessonEvent, Proof, SchoolEvent } from '@models';
import { DatePipe, LowerCasePipe, NgClass, NgStyle } from '@angular/common';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { User } from '@core/models/interface';
import { MatTooltip } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  LessonEventFormDialogComponent
} from '@modules/lessons/dialogs/lesson-event-form-dialog/lesson-event-form-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LessonEventService } from '@services/lesson-event.service';
import { UpdateService } from '@services/update.service';
import { MatBadge } from '@angular/material/badge';
import { ActivityService } from '@modules/config/activity/activity.service';
import { AuthService } from '@services';
import { EventCard } from '@ui/event-card/event-card';
import { Skeleton } from '@ui/skeleton/skeleton';

@Component({
  selector: 'app-main-dashboard',
  standalone: true,
  imports: [
    MatCardModule,
    DatePipe,
    TranslateModule,
    MatTooltip,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    NgStyle,
    MatBadge,
    NgClass,
    LowerCasePipe,
    EventCard,
    Skeleton,
    Skeleton
  ],
  providers: [
    TranslatePipe
  ],
  templateUrl: './main-dashboard.component.html',
  styleUrl: './main-dashboard.component.scss'
})
export class MainDashboardComponent implements OnInit, OnDestroy {
  private lessonEventService = inject(LessonEventService);
  private cdr = inject(ChangeDetectorRef);
  private dialog = inject(MatDialog);
  private translatePipe = inject(TranslatePipe);
  private snack = inject(MatSnackBar);
  private updateService = inject(UpdateService);
  private activityService = inject(ActivityService);
  private destroy$: Subject<void> = new Subject<void>();
  private pendingUpdate = false;
  // private authService = inject(AuthService);
  // public user = this.authService.user$.value;
  user = input.required<User>();
  events: LessonEvent[] = [];
  dateFormat = 'dd/MM/yyyy';
  proofStatusClass: any = Proof.statusClass;
  activities: Map<string, ActivityConfig> = new Map();
  isLoading = signal(true);

  async ngOnInit() {
    await this.getEvents();

    this.updateService.proof$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.getEvents().then();
    });

    this.activities = await this.activityService.getMap();
    this.isLoading.set(false);
  }

  async getEvents() {
    // this.isLoading.set(true);
    const params = {
      limit: this.user().role === 'teacher' ? 36 : 24,
      prevDate: false,
    }
    this.events = await firstValueFrom(this.lessonEventService.getAll(params));
    // this.isLoading.set(false);
    this.cdr.detectChanges();
  }

  openLessonEventDialog(event: LessonEvent) {
    const datePipe = new DatePipe('pt-BR');
    const dialogRef = this.dialog.open(LessonEventFormDialogComponent, {
      data: {
        item: event,
        lessonId: event.lesson?.id,
        timeScheduleId: event.frequency?.timeSchedule?.id || 0,
        date: event.date,
        action: 'edit',
      },
      autoFocus: false,
      disableClose: true,
      width: '800px',
      maxWidth: '100vw',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getEvents().then();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
