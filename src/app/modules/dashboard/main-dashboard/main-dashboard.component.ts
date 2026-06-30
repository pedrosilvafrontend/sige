import {
  ChangeDetectorRef, Component, effect, inject, input, OnDestroy, OnInit, signal, ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { debounceTime, distinctUntilChanged, firstValueFrom, startWith, Subject, takeUntil } from 'rxjs';
import { ActivityConfig, LessonEvent, Test } from '@models';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
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
import { newColorsBy, ColorsMap, ColoringBy } from '@models/colors-by';
import { getColorBy } from '@util/coloring-by-pipe';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatInput } from '@angular/material/input';
import { endOfYear, format, isValid, setDay, setMonth, setYear, startOfDay } from 'date-fns';
import { DatePickerFormatDirective } from '@util/datepicker-format.directive';
import { DateUtil } from '@util';
import { FnsPipe } from '@util/fns-pipe';
import { ActivitiesFilterFormComponent } from '@form/activities-filter-form/activities-filter-form.component';
import { ActivitiesFilter } from '@form/lesson-event-filter.form';

interface DashFilters {
  date: FormControl<Date | null>;
  colorBy: FormControl<ColoringBy>;
}

@Component({
  selector: 'app-main-dashboard',
  standalone: true,
  imports: [
    MatCardModule,
    TranslatePipe,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    EventCard,
    Skeleton,
    MatRadioButton,
    MatRadioGroup,
    MatDatepickerModule,
    MatInput,
    DatePickerFormatDirective,
    DatePipe,
    FnsPipe,
    ActivitiesFilterFormComponent
  ],
  providers: [
    TranslatePipe,
  ],
  templateUrl: './main-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './main-dashboard.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class MainDashboardComponent implements OnInit, OnDestroy {
  protected lessonEventService = inject(LessonEventService);
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
    date: this.fb.control<Date | null>(new Date()),
    colorBy: this.fb.control<ColoringBy>(null),
  });
  loadedEvents = false;
  activitiesFilter!: ActivitiesFilter;

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

    effect(() => {
      this.events = this.lessonEventService.lessonEvents() || [];
      this.cdr.detectChanges();
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
      .pipe(
        debounceTime(600), // Aguarda 600 milissegundos sem o usuário digitar
        distinctUntilChanged(), // Só executa se o valor atual for diferente do anterior
        takeUntil(this.destroy$),
        startWith(this.filters.getRawValue())
      )
      .subscribe(() => {
        const dateCtrl = this.filters.controls.date;
        const validDate = (date: Date) => !isNaN(date?.getTime?.());
        if (!dateCtrl.value || !validDate(dateCtrl.value)) {
          dateCtrl.setValue(new Date());
          return;
        }
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
    this.loadedEvents = false;
    this.events.length = 0;
    const { date, ...filters } = this.filters.getRawValue();
    const nextBusinessDay = DateUtil.nextBusinessDay(new Date());
    const dateFormat = 'yyyy-MM-dd';
    const formattedDate = date instanceof Date && isValid(date)
      ? format(date, dateFormat)
      : format(nextBusinessDay, dateFormat);
    const params: any = {
      limit: 150,
      prevDate: false,
      ...filters,
      ...this.activitiesFilter
    }
    if (this.auth()?.role === 'teacher') {
      params.month = formattedDate;
    } else {
      params.date = formattedDate;
    }
    this.lessonEventService.getBy(params);

    // this.events = await firstValueFrom(this.lessonEventService.getAll(params).pipe(debounceTime(500),distinctUntilChanged()));
    this.loadedEvents = true;
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

  protected activitiesFilterChange($event: ActivitiesFilter) {
    this.activitiesFilter = $event;
    this.refresh().then();
  }
}
