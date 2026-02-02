import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { CalendarOptions, DateSelectArg, EventApi, EventClickArg, EventInput, } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Calendar } from './calendar.model';
import { EventDialogComponent } from './dialogs/event-dialog/event-dialog.component';
import { MatSnackBar, } from '@angular/material/snack-bar';
import { MatCheckboxModule, } from '@angular/material/checkbox';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { MatButtonModule } from '@angular/material/button';
import { PageHeaderComponent } from '@ui/page-header/page-header.component';
import { MatCardModule } from '@angular/material/card';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { firstValueFrom, lastValueFrom, Subject, take, takeUntil } from 'rxjs';
import {
  LessonEventFormDialogComponent
} from '@modules/lessons/dialogs/lesson-event-form-dialog/lesson-event-form-dialog.component';
import { SchoolEvent } from '@modules/lessons/lesson-events';
import { LesEventService } from '@modules/lessons/lesson-events/lesson-event.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormGroupEntriesPipe } from '@core/util/form-group-entries.pipe';
import { NgClass, TitleCasePipe, UpperCasePipe } from '@angular/common';
import { Util } from '@core/util/util';
import { SchoolSelectComponent } from '@modules/schools/school-select/school-select.component';
import { TeacherSelectComponent } from '@modules/teachers/teacher-select/teacher-select.component';
import { UserType } from '@modules/users/users.model';
import { User } from '@core/models/interface';
import { ClassSelectComponent } from '@modules/classes/class-select/class-select.component';
import { ActivatedRoute } from '@angular/router';
import { Activity, Degree, LessonEvent, School, SchoolClass } from '@models';
import { AuthService, EventService, SchoolsService } from '@services';
import { Button } from '@ui/button/button';
import { debounceTime } from 'rxjs/operators';
import { DegreesService } from '@services/degrees.service';
import { LessonEventService } from '@services/lesson-event.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    MatCardModule,
    MatButtonModule,
    MatCheckboxModule,
    FullCalendarModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    FormGroupEntriesPipe,
    TranslateModule,
    TitleCasePipe,
    SchoolSelectComponent,
    TeacherSelectComponent,
    UpperCasePipe,
    ClassSelectComponent,
    Button,
    NgClass,
  ]
})
export class CalendarComponent implements OnInit, OnDestroy {
  private fb = inject(UntypedFormBuilder);
  private dialog = inject(MatDialog);
  private eventService = inject(EventService);
  private lessonEventService = inject(LessonEventService);
  private schoolsService = inject(SchoolsService);
  private degreesService = inject(DegreesService);
  private lesEventService = inject(LesEventService);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);
  private auth = inject(AuthService);
  private activatedRoute = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild(FullCalendarComponent, { static: false }) calendarComponent!: FullCalendarComponent;
  calendar: Calendar | null;
  public addCusForm: UntypedFormGroup;
  dialogTitle: string;
  originalData: any[] = [];
  calendarData!: Calendar;
  eventCategories: string[] = [];
  schools: School[] = [];
  degrees: Degree[] = [];
  objectCompare = Util.objectCompare;
  private destroy$ = new Subject<void>();
  protected classHash = '';

  calendarEvents: EventInput[] = [];

  /** school controls added in template **/
  filters = this.fb.group({
    activities: this.fb.group({
      test: [false],
      work: [false],
    }),
    group: this.fb.group({
      lesson: [true],
    }),
    school: this.fb.control(null),
    degreeId: this.fb.control(null),
    schoolClass: this.fb.control(null),
    teacher: this.fb.control(null)
  });
  calendarOptionsForm = this.fb.group({
    weekends: [false]
  })
  authRole: UserType = '';
  authUser: User = {};
  public = false;
  dataFilters: any = {
    school: {},
    schoolClass: {}
  }

  constructor() {
    this.dialogTitle = 'Add New Event';
    const blankObject = {} as Calendar;
    this.calendar = new Calendar(blankObject);
    this.addCusForm = this.createCalendarForm(this.calendar);
    this.authRole = this.auth.user$.value.role || '';
    this.authUser = this.auth.user$.value;
    if (this.activatedRoute.snapshot.url[0]?.path === 'public') {
      this.public = true;
    }
  }

  openPublicLink() {
    const hash = this.filters.controls['schoolClass']?.value?.hash;
    const url = `/public/calendar/${hash}`;
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.click();
  }

  isFormFilterComplete() {
    const { group, activities, school, schoolClass: classControl, teacher } = this.filters.controls;
    const incomplete = (!group || !activities || !school || !classControl || (this.authRole !== 'teacher' && !teacher));
    return !incomplete;
  }

  filterChanges() {

    if (!this.isFormFilterComplete()) return;
    const { group, activities, school, schoolClass: classControl } = this.filters.controls;

    group.get('lesson')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(isLesson => {
      if (isLesson) {
        activities.setValue({
          test: false,
          work: false,
        }, { emitEvent: false });
      }
    });

    activities.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      const checkedLesson = !Object.values(value).some(a => !!a);
      group.setValue({
        lesson: checkedLesson,
      }, { emitEvent: false });

    });

    school.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((school: School) => {
      const schoolClass = classControl.value as SchoolClass;
      if (!school?.id || schoolClass?.school?.id != school?.id) {
        classControl.reset({}, { emitEvent: false });
      }
    });


  }

  setCalendarOptions() {
    const api = this.calendarComponent?.getApi();
    if (!api) return;
    const options = this.calendarOptionsForm.value;
    api.setOption('weekends', options.weekends);
  }

  async ngOnInit(): Promise<void> {
    this.classHash = this.activatedRoute.snapshot.paramMap.get('classHash') || '';
    if (!this.public) {
      this.eventCategories = await firstValueFrom(this.eventService.getEventCategories());
      this.schools = await lastValueFrom(this.schoolsService.getAll());
      this.degrees = await firstValueFrom(this.degreesService.getAll());
      if (this.schools.length > 1) {
        this.filters.get('school')?.setValue(this.schools[0]);
      }
      this.filters.get('schoolClass')?.setValue(this.classHash);
    }
    this.cdr.detectChanges();

    this.filterChanges();

    this.filters.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(700)
    ).subscribe((data: any) => {
      this.applyFilter();
    })
    this.applyFilter();
  }

  refresh() {
    this.calendarComponent?.getApi().refetchEvents();
  }

  calendarOptions: CalendarOptions = (() => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    return {
      timeZone: 'local',
      height: 'auto',
      eventTimeFormat: {
        hour: '2-digit',
        minute: '2-digit'
      },
      plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth',
      },
      buttonText: {
        today: 'Hoje',
        dayGridMonth: 'Mês',
        timeGridWeek: 'Semana',
        timeGridDay: 'Dia',
        listMonth: 'Lista',
      },
      initialView: 'listMonth',
      weekends: false,
      editable: true,
      selectable: true,
      selectMirror: true,
      dayMaxEvents: true,
      select: this.handleDateSelect.bind(this),
      eventClick: this.handleEventClick.bind(this),
      eventsSet: this.handleEvents.bind(this),
      locale: this.translate.currentLang,
      eventColor: '#a8a8a8',
      events: function(info, successCallback, failureCallback) {
        const classHash = self.classHash;
        const schoolId = self.filters.get('school')?.value?.id;
        const degreeId = self.filters.get('degreeId')?.value;
        const params: any = {
          start: info.startStr,
          end: info.endStr,
          prevDate: true
        }
        const setData = (data: any[]) => {
          self.originalData = Object.assign([], data || []);
          successCallback(data);
          self.cdr.detectChanges();
        }
        if (classHash) {
          params.classHash = classHash;
        }
        if (degreeId) {
          params.degreeId = degreeId;
        }
        if (schoolId) {
          params.schoolId = schoolId;
        }
        if (!schoolId && !classHash) {
          return setData([] as any[]);
        }
        // self.eventService.getAllCalendars(params).pipe(take(1))
        self.lessonEventService.getAll(params).pipe(take(1))
          .subscribe({
            next: (value) => {
              const data: any[] = (value || []).filter(
                (event: LessonEvent) => {
                  const item: any = event;
                  if (!item.groupId) {
                    item.groupId = 'LESSON';
                  }
                  const { lesson, school, schoolClass, curricularComponent } = event;
                  let title: string[] = [];
                  const hasFilterSchool = !!self.filters.get('school')?.value?.id;
                  const hasFilterClass = !!self.filters.get('schoolClass')?.value?.id;
                  const hasFilterTeacher = !!self.filters.get('teacher')?.value?.id;
                  if (lesson) {
                    if (school?.acronym && !hasFilterSchool && self.schools.length > 1) title.push(school.acronym);
                    if (schoolClass?.code && !hasFilterClass) title.push(schoolClass.code);
                    if (curricularComponent?.name) title.push(curricularComponent.name);
                    if (lesson.teacher?.fullName && !hasFilterTeacher) title.push(lesson.teacher.fullName);
                  }
                  item.title = title.join(' - ');
                  if (item.activities) {
                    item.activities.forEach((activity: any) => {
                      item.className = `${item.className || ''} event-activity-${activity.id.toLowerCase()}`;
                      item.borderColor = activity.color;
                      item.backgroundColor = activity.color;
                    });
                  }
                  return self._filter(item);
                }
              );
              setData(data);
            },
            error: (err: Error) => {
              failureCallback(err);
            }
          })
      },
      ...this.calendarOptionsForm.value
    }
  })();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleDateSelect(selectInfo: DateSelectArg) {
    if (this.public) {
      return;
    }
    // this.addNewEvent();
  }

  addNewEvent() {
    if (this.public) {
      return;
    }
    const dialogRef = this.dialog.open(EventDialogComponent, {
      data: {
        calendar: this.calendar,
        action: 'add',
        categories: this.eventCategories || []
      },
      autoFocus: false,
      disableClose: true,
      width: '800px',
      maxWidth: '100vw',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'submit') {
        this.addCusForm.reset();
        this.showNotification(
          'snackbar-success',
          'Salvo com sucesso!',
        );
        this.refresh();
      }
    });
  }

  lastParams = '';
  applyFilter() {
    const strParams = JSON.stringify(this.filters.value);
    if (this.lastParams === strParams) {
      return;
    }
    this.lastParams = strParams;
    this.refresh();
  }

  private _filter(item: LessonEvent): boolean {
    const filters = this.filters.value as {
      activities: Record<string, boolean>,
      group: Record<string, boolean>,
      school: { id: number, name: string, acronym: string },
      teacher: { id: number, fullName: string, email: string },
      schoolClass: {
        id: null, year: null, suffix: null, dayShift: null,
        school: { id: number, name: string, acronym: string },
      }
    };

    const { lesson, school, schoolClass, activities, groupId } = item || {} as LessonEvent;

    /** exclusive **/

    if (!this.classHash) {
      if (filters.school?.id && school?.id !== filters.school.id) {
        return false;
      }

      if (filters.schoolClass?.id && schoolClass?.id !== filters.schoolClass.id) {
        return false;
      }
    }

    if (filters.teacher?.id && lesson?.teacher?.id !== filters.teacher?.id) {
      return false;
    }

    /** inclusive **/
    // const selectedActivities = Object.keys(filters.activities).filter(k => filters.activities[k]);
    const hasActivity = (activities || []).some((activity: Activity) => filters.activities[activity.id.toLowerCase()]);

    if (hasActivity) {
      return true;
    }

    if (filters.group[(groupId || '').toLowerCase()]) {
      return true;
    }

    return false;
  }

  handleEventClick(clickInfo: EventClickArg) {
    this.eventClick(clickInfo);
  }

  eventClick(row: EventClickArg) {
    if (row.event.groupId === 'LESSON') {
      this.openLesEventDialog(row);
      return;
    }
    this.openEventDialog(row);
  }

  openLesEventDialog(row: EventClickArg) {
    const props = row.event.extendedProps;
    const lessonId: number = props['lesson']?.id || 0;
    this.lesEventService.setParams({lessonId: lessonId});

    const dialogRef = this.dialog.open(LessonEventFormDialogComponent, {
      data: {
        item: {
          ...props,
          date: row.event.start
        },
        action: this.public ? 'view' : 'edit'
      },
      autoFocus: false,
      disableClose: true,
      width: '800px',
      maxWidth: '100vw',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refresh();
      }
    })
  }

  openEventDialog(row: EventClickArg) {
    const props = row.event.extendedProps;
    const lessonId: number = props['lesson']?.id || 0;
    const calendarData = {
      id: row.event.id,
      title: row.event.title,
      groupId: row.event.groupId,
      startDate: row.event.start,
      endDate: row.event.end,
      details: props['details'],
      lesson: lessonId ? { id: lessonId } : null,
    };

    const dialogRef = this.dialog.open(EventDialogComponent, {
      data: {
        calendar: calendarData,
        action: 'edit',
        categories: this.eventCategories || []
      },
      autoFocus: false,
      disableClose: true,
      width: '800px',
      maxWidth: '100vw',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'submit') {
        // this.calendarData = this.eventService.getDialogData();
        this.calendarEvents?.forEach((element, index) => {
          if (calendarData.id === element.id) {
            this.editEvent(index, this.calendarData);
          }
        }, this);
        this.showNotification(
          'black',
          'Atualizado com sucesso!',
        );
        this.addCusForm.reset();
      } else if (result === 'delete') {
        this.calendarData = this.eventService.getDialogData();
        this.calendarEvents?.forEach((element) => {
          if (this.calendarData.id === element.id) {
            row.event.remove();
          }
        }, this);

        this.showNotification(
          'snackbar-danger',
          'Excluído com sucesso!',
        );
      }
      this.refresh();
    });
  }

  editEvent(eventIndex: number, calendarData: Calendar) {

    const calendarEvents: EventInput[] = Object.assign([], this.calendarEvents);
    const singleEvent = Object.assign({}, calendarEvents[eventIndex]);
    singleEvent.id = calendarData.id;
    singleEvent.title = calendarData.title;
    singleEvent.start = calendarData.startDate;
    singleEvent.end = calendarData.endDate;
    singleEvent.className = `event-${calendarData.groupId} event-lesson-${calendarData.lesson?.id}`;
    singleEvent.groupId = calendarData.groupId;
    singleEvent['details'] = calendarData.details;
    calendarEvents[eventIndex] = singleEvent;
    this.calendarEvents.length = 0;
    Object.assign(this.calendarEvents, calendarEvents);
    // this.calendarEvents = calendarEvents; // reassign the array

    // this.calendarOptions.events = Object.assign([], calendarEvents);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleEvents(events: EventApi[]) {
    // this.currentEvents = lesson-events;
  }

  createCalendarForm(calendar: Calendar): UntypedFormGroup {
    return this.fb.group({
      id: [calendar.id],
      title: [
        calendar.title,
        [Validators.required, Validators.pattern('[a-zA-Z]+([a-zA-Z ]+)*')],
      ],
      category: [calendar.groupId],
      startDate: [calendar.startDate, [Validators.required]],
      endDate: [calendar.endDate, [Validators.required]],
      details: [
        calendar.details,
        [Validators.required, Validators.pattern('[a-zA-Z]+([a-zA-Z ]+)*')],
      ],
    });
  }

  showNotification(
    colorName: string,
    text: string,
  ) {
    this.snackBar.open(text, '', {
      duration: 3000,
      panelClass: colorName,
    });
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
