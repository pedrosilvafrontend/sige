import { ChangeDetectorRef, Component, effect, inject, input, OnDestroy, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { debounce, distinctUntilChanged, firstValueFrom, startWith, Subject, takeUntil } from 'rxjs';
import { ActivityConfig, LessonEvent, Test } from '@models';
import { DatePipe } from '@angular/common';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { User } from '@core/models/interface';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatInput } from '@angular/material/input';
import { Util } from '@util/util';
import { endOfYear, format, isValid, setDay, setMonth, setYear, startOfDay } from 'date-fns';
import { DatePickerFormatDirective } from '@util/datepicker-format.directive';
import { LoadingBar } from '@ui/loading-bar/loading-bar';
import { debounceTime } from 'rxjs/operators';
import { Debounce } from '@util/debounce';
import { DateUtil } from '@util';

interface DashFilters {
  date: FormControl<Date | null>;
  colorBy: FormControl<ColoringBy>;
}

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
    MatRadioButton,
    MatRadioGroup,
    MatDatepickerModule,
    ColoringByPipe,
    MatInput,
    DatePickerFormatDirective,
    LoadingBar
  ],
  providers: [
    TranslatePipe,
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
  private fb = new FormBuilder();
  auth = input.required<User>();
  isManager = false
  events: LessonEvent[] = [];
  dateFormat = 'dd/MM/yyyy';
  proofStatusClass: any = Test.statusClass;
  activities: Map<string, ActivityConfig> = new Map();
  isLoading = signal(true);
  // colorByControl = new FormControl<"school" | "class" | "curricularComponent" | null>(null);
  colors = newColorsBy();
  minDate = startOfDay(new Date());
  maxDate = endOfYear(new Date());
  filters: FormGroup<DashFilters> = this.fb.group<DashFilters>({
    date: this.fb.control<Date | null>(null),
    colorBy: this.fb.control<ColoringBy>(null),
  });

  get colorByControl(): FormControl<ColoringBy> {
    return this.filters.controls.colorBy;
  }

  timeLoading = 0;
  get loading() {
    return this.isLoading();
  }
  set loading(value: boolean) {
    clearTimeout(this.timeLoading);
    this.timeLoading = setTimeout(() => {
      this.isLoading.set(value);
    }, 3000);
  }

  constructor() {
    effect(() => {
      const role = this.auth()?.role || '';
      if(!this.colorByControl.value) {
        let coloringBy: ColoringBy = null;
        if (role == 'teacher') {
          coloringBy = 'class';
        }
        if (role == 'coordinator') {
          coloringBy = 'curricularComponent';
        }
        this.colorByControl.setValue(coloringBy, { emitEvent: false });
      }
      this.isManager = ['admin', 'association', 'principal', 'coordinator'].includes(role)
    });
  }

  monthSelected(normalizedMonthAndYear: Date, datepicker: MatDatepicker<Date>) {
    if (this.isManager) {
      return;
    }
    const ctrl = this.filters.controls.date;
    let ctrlValue = ctrl.value ? new Date(ctrl.value) : new Date();

    ctrlValue = setMonth(ctrlValue, normalizedMonthAndYear.getMonth());
    ctrlValue = setYear(ctrlValue, normalizedMonthAndYear.getFullYear());

    ctrl.setValue(ctrlValue);
    datepicker.close(); // Halts navigation so it doesn't drill down to days
  }

  async ngOnInit() {

    this.activities = await this.activityService.getMap();
    this.loading = false;

    this.filters.valueChanges
      .pipe(takeUntil(this.destroy$), startWith(this.filters.getRawValue()))
      .subscribe(() => {
        this.refresh();
      });
  }

  async refresh() {
    this.loading = true;
    // await this.getColors();
    await this.getEvents();
    this.cdr.detectChanges();
    this.loading = false;
  }

  private async getEvents() {
    const { date, ...filters } = this.filters.getRawValue();
    const nextBusinessDay = DateUtil.nextBusinessDay(new Date());
    const dateFormat = 'yyyy-MM-dd';

    const formattedDate = date instanceof Date && isValid(date)
      ? format(date, dateFormat)
      : format(nextBusinessDay, dateFormat);
    const params = {
      limit: 150,
      prevDate: false,
      ...filters,
      ...{ date: formattedDate },
    }
    this.events = await firstValueFrom(this.lessonEventService.getAll(params).pipe(debounceTime(500),distinctUntilChanged()));
    this.cdr.detectChanges();
  }


  async getColors() {
    const coloringBy = this.colorByControl.value as "school" | "class" | "curricularComponent" | null;
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
    const coloringBy = this.colorByControl.value;
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
