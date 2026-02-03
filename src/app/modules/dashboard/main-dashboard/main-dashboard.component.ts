import { ChangeDetectorRef, Component, inject, input, OnDestroy, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { LessonEvent, Proof, SchoolEvent } from '@models';
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
    LowerCasePipe
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
  private destroy$: Subject<void> = new Subject<void>();
  private pendingUpdate = false;
  user = input.required<User>();
  events: LessonEvent[] = [];
  dateFormat = 'dd/MM/yyyy';
  public proofStatusClass: any = Proof.statusClass;

  async ngOnInit() {
    await this.getEvents();

    this.updateService.proof$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.getEvents().then();
    });
  }

  async getEvents() {
    const params = {
      limit: 12,
      prevDate: false,
    }
    this.events = await firstValueFrom(this.lessonEventService.getAll(params));
    this.cdr.detectChanges();
  }

  openLessonEventDialog(event: LessonEvent) {
    const dialogRef = this.dialog.open(LessonEventFormDialogComponent, {
      data: {
        item: event,
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
