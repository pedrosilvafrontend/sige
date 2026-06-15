import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, ElementRef,
  inject,
  OnDestroy,
  OnInit, signal,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { CalendarOptions, DateSelectArg, EventApi, EventClickArg, EventInput } from '@fullcalendar/core';
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
import { MatCardModule } from '@angular/material/card';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { firstValueFrom, lastValueFrom, Observable, of, Subject, switchMap, take, takeUntil } from 'rxjs';
import {
  LessonEventFormDialogComponent
} from '@modules/lessons/dialogs/lesson-event-form-dialog/lesson-event-form-dialog.component';
import { LesEventService } from '@modules/lessons/lesson-events/lesson-event.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormGroupEntriesPipe } from '@core/util/form-group-entries.pipe';
import { NgClass, TitleCasePipe, UpperCasePipe } from '@angular/common';
import { Util } from '@core/util/util';
import { User } from '@core/models/interface';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityConfig, Degree, Test, School, SchoolClass, LiteEvent } from '@models';
import { AuthService, EventService, SchoolsService } from '@services';
import { Button } from '@ui/button/button';
import { map } from 'rxjs/operators';
import { DegreesService } from '@services/degrees.service';
import { LessonEventService } from '@services/lesson-event.service';
import { ActivityService } from '@modules/config/activity/activity.service';
import { LessonsFormDialogComponent } from '@modules/lessons';
import { Skeleton } from '@ui/skeleton/skeleton';
import { LoadingService } from '@services/loading.service';
import { startOfYear } from 'date-fns';
import { MatMenuModule } from '@angular/material/menu';
import {TeacherCcSelectComponent} from '@modules/teachers/teacher-cc-select/teacher-cc-select.component';

@Component({
  selector: 'app-calendar',
  templateUrl: './public-calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
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
    TeacherCcSelectComponent,
    UpperCasePipe,
    NgClass,
    Skeleton,
    Skeleton,
    Button,
    MatMenuModule,
  ]
})
export class PublicCalendarComponent implements OnInit, OnDestroy {
  private fb = inject(UntypedFormBuilder);
  private dialog = inject(MatDialog);
  private eventService = inject(EventService);
  private lessonEventService = inject(LessonEventService);
  private schoolsService = inject(SchoolsService);
  private degreesService = inject(DegreesService);
  private lesEventService = inject(LesEventService);
  private activityService = inject(ActivityService);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);
  private authService = inject(AuthService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private elementRef = inject(ElementRef);
  isLoading = signal(true);
  auth = this.authService.user$.value;

  @ViewChild(FullCalendarComponent, { static: false }) calendarComponent!: FullCalendarComponent;
  calendar: Calendar | null;
  public addCusForm: UntypedFormGroup;
  dialogTitle: string;
  originalData: any[] = [];
  lastParams: any;
  calendarData!: Calendar;
  eventCategories: string[] = [];
  schools: School[] = [];
  degrees: Degree[] = [];
  objectCompare = Util.objectCompare;
  private destroy$ = new Subject<void>();
  protected classHash = '';
  public proofStatusClass: any = Test.statusClass;
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
    weekends: [true]
  })
  authUser: User = {};
  public = true;
  dataFilters: any = {
    school: {},
    schoolClass: {}
  }
  activities: { [key: string]: ActivityConfig } = {};

  protected deferredPrompt = signal<any>(null);
  protected showInstallButton = signal<boolean>(true);
  protected utmSource: string = '';

  constructor() {
    this.dialogTitle = 'Add New Event';
    const blankObject = {} as Calendar;
    this.calendar = new Calendar(blankObject);
    this.addCusForm = this.createCalendarForm(this.calendar);
    this.authUser = this.authService.user$.value;

    window.addEventListener('beforeinstallprompt', (e) => {
      // Previne que o Chrome 67 e versões anteriores mostrem o prompt automaticamente
      e.preventDefault();
      // Guarda o evento para que possa ser disparado mais tarde.
      this.deferredPrompt.set(e);
      // Atualiza a UI para mostrar o botão de instalação
      this.showInstallButton.set(true);
    });

    window.addEventListener('appinstalled', (evt) => {
      console.log('App instalado com sucesso!');
      this.showInstallButton.set(false);
      this.deferredPrompt.set(null);
    });
  }

  installApp() {
    // if (this.utmSource === 'PWA') {
    //   return;
    // }
    const promptEvent = this.deferredPrompt();
    if (!promptEvent) return;

    // Mostra o prompt de instalação
    promptEvent.prompt();

    // Aguarda a resposta do usuário
    promptEvent.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('Usuário aceitou a instalação');
      } else {
        console.log('Usuário recusou a instalação');
      }
      this.deferredPrompt.set(null);
      this.showInstallButton.set(false);
    });
  }

  changeToRestrictManifest() {
    let link = document.querySelector('link[rel="manifest"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'manifest');
      document.head.appendChild(link);
    }
    link.setAttribute('href', 'manifest-restrict.json');
  }

  isFormFilterComplete() {
    const { group, activities, school, schoolClass: classControl, teacher } = this.filters.controls;
    const incomplete = (!group || !activities || !school || !classControl || !teacher);
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

  toggleView() {
    const api = this.calendarComponent?.getApi();
    if (!api) return;
    const viewType = api.view.type === 'listMonth' ? 'listYear' : 'listMonth';
    api.changeView(viewType);
    this.cdr.detectChanges();
  }

  setCalendarView(viewType: 'multiMonthYear' | 'listMonth' | 'listYear') {
    // dayGridMonth: Visão mensal tradicional em grade.
    // dayGridWeek: Visão semanal em grade (sem divisão por horários).
    // dayGridDay: Visão diária em grade (mostra apenas o dia atual).
    // dayGrid: Visão customizada em grade (permite definir um número específico de dias).
    // timeGridWeek: Visão semanal com divisões horizontais de horários (agenda).
    // timeGridDay: Visão diária com divisões horizontais de horários.Visões de Lista (List Views)
    // listYear: Lista consecutiva de eventos programados para o ano inteiro.
    // listMonth: Lista de eventos programados para o mês atual.
    // listWeek: Lista de eventos programados para a semana atual.
    // listDay: Lista de eventos programados apenas para o dia atual.Visões Multimês (Multi-Month Views)
    // multiMonthYear: Visão em grade que exibe os 12 meses do ano na mesma tela.
    const api = this.calendarComponent?.getApi();
    if (!api) return;
    const now = new Date();
    if (viewType === 'listYear' || viewType === 'multiMonthYear') {
      api.setOption('validRange', {start: startOfYear(now)});
    } else {
      api.setOption('validRange', {start: now});
    }
    api.changeView(viewType);
    this.cdr.detectChanges();
  }

  setCalendarOptions() {
    const api = this.calendarComponent?.getApi();
    if (!api) return;
    const options = this.calendarOptionsForm.value;
    api.setOption('weekends', options.weekends);
  }

  async ngOnInit(): Promise<void> {
    this.classHash = this.activatedRoute.snapshot.paramMap.get('classHash') || '';
    if (this.classHash) {
      localStorage.setItem('classHash', this.classHash);
    }

    // this.utmSource = this.activatedRoute.snapshot.queryParams['utm_source'];
    this.changeToRestrictManifest();

    if (!this.public) {
      this.eventCategories = await firstValueFrom(this.eventService.getEventCategories());
      this.schools = await lastValueFrom(this.schoolsService.getAll());
      this.degrees = await firstValueFrom(this.degreesService.getAll());
      if (this.schools.length > 1) {
        this.filters.get('school')?.setValue(this.schools[0]);
      }
      this.filters.get('schoolClass')?.setValue(this.classHash);
    }

    this.filterChanges();

    // this.filters.valueChanges.pipe(
    //   takeUntil(this.destroy$),
    //   debounceTime(700)
    // ).subscribe((data: any) => {
    //   this.applyFilter();
    // })
    // this.applyFilter();
    this.activities = await firstValueFrom(
      this.activityService.getAll({classHash: this.classHash}).pipe(
        map(activities => {
          return activities.reduce((acc: any, activity: ActivityConfig) => {
            this.elementRef.nativeElement.style.setProperty(`--${activity.id.toLowerCase()}-color`, activity.color);
            acc[activity.id] = activity;
            return acc;
          }, {});
        })
      )
    );
    this.cdr.detectChanges();
  }

  refresh() {
    this.calendarComponent?.getApi().refetchEvents();
  }

  getFilters() {
    const filters = {
      school: null as any,
      degreeId: 0,
      teacherId: 0,
      activities: {
        test: false,
        work: false
      }
    }
    return Object.keys(filters).reduce(
      (acc, k) => {
        if (k === 'teacherId') {
          acc.teacherId = this.filters.get('teacher')?.value?.id || 0;
          return acc;
        }

        let val = this.filters.get(k)?.value;
        if (val) {
          acc[k] = val;
        }
        return acc;
      },
      filters as any
    )
  }

  getParams(initialParams?: any) {
    const classHash = this.classHash;
    const { school, degreeId, activities, teacherId } = this.getFilters();
    const schoolId = school?.id || 0;
    if (!schoolId && !classHash) {
      return {} as any;
    }

    const params: any = initialParams || {}
    if (activities.test) {
      params.proof = true;
    }
    if (activities.work) {
      params.work = true;
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
    if (teacherId) {
      params.teacherId = teacherId;
    }
    return params;
  }

  filterOriginal() {
    return this.originalData.filter(this._filter.bind(this));
  }

  getRequest(params: any) {
    if (!params.start || !params.end) {
      return;
    }
    // const { start, end } = this.lastParams || {};
    // if (start == params.start && end == params.end && this.originalData.length) {
    //   return;
    // }
    //
    // this.lastParams = params;

    // resultados$ = this.requisicaoSubject.pipe(
    //   switchMap(({ termo, buscarFn }) => buscarFn(termo))
    // );

    return !params.schoolId && params.classHash ?
      this.lessonEventService.getPublicAllLite(params).pipe(take(1)) :
      this.lessonEventService.getAllLite(params).pipe(take(1));
  }

  loadingService = inject(LoadingService);
  isFcLoading = true;
  timeFcLoading = 0;
  fcLoading(isLoading: boolean) {
    clearTimeout(this.timeFcLoading);
    if (isLoading) {
      this.isFcLoading = true;
      this.loadingService.show('isFcLoading');
    } else {
      this.timeFcLoading = setTimeout(() => {
        this.isFcLoading = false;
        this.loadingService.hide('isFcLoading');
        this.cdr.detectChanges();
      }, 1000);
    }
  }

  setToday() {
    const api = this.calendarComponent?.getApi();
    if (!api) return;
    api.today();
    this.scrollToToday();
  }

  scrollToToday() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0'); // Meses começam em 0
    const dia = String(hoje.getDate()).padStart(2, '0');
    const date = `${ano}-${mes}-${dia}`;
    this.scrollToDate(date);
  }

  scrollToDate(dateString: string): void {
    const element = document.querySelector(`[data-date="${dateString}"]`) as HTMLElement;

    if (element) {
      // 1. Encontra o container que realmente tem o scroll (seja o body ou uma div interna)
      const scrollContainer = this.getScrollParent(element);

      if (scrollContainer === document.body || scrollContainer === document.documentElement) {
        // Cenário A: Rolagem na página inteira
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - (window.innerHeight / 2) + (element.clientHeight / 2);

        window.scrollTo({ top: offsetPosition, behavior: 'auto' });
      } else {
        // Cenário B: Rolagem dentro de uma DIV interna (Causa mais provável do erro)
        const containerTop = scrollContainer.getBoundingClientRect().top;
        const elementTop = element.getBoundingClientRect().top;

        // Calcula a nova posição relativa interna do container
        const targetScroll = scrollContainer.scrollTop + (elementTop - containerTop) - (scrollContainer.clientHeight / 2) + (element.clientHeight / 2);

        scrollContainer.scrollTo({ top: targetScroll, behavior: 'auto' });
      }
    } else {
      console.warn(`Elemento com a data ${dateString} não foi encontrado.`);
    }
  }

// Função auxiliar para detectar quem é o pai responsável pelo scroll
  private getScrollParent(node: HTMLElement | null): HTMLElement {
    if (node == null) {
      return document.body;
    }
    if (node.scrollHeight > node.clientHeight) {
      const overflowY = window.getComputedStyle(node).overflowY;
      if (overflowY === 'auto' || overflowY === 'scroll') {
        return node;
      }
    }
    return this.getScrollParent(node.parentElement);
  }

  calendarOptions: CalendarOptions = (() => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const startRange = new Date();
    return {
      timeZone: 'local',
      height: 'auto',
      eventTimeFormat: {
        hour: '2-digit',
        minute: '2-digit'
      },
      plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
      headerToolbar: {
        left: 'prev,next',
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
      weekends: true,
      editable: true,
      selectable: true,
      selectMirror: true,
      dayMaxEvents: true,
      select: this.handleDateSelect.bind(this),
      eventClick: this.handleEventClick.bind(this),
      eventsSet: this.handleEvents.bind(this),
      locale: this.translate.getCurrentLang(),
      validRange: {
        start: startRange
      },
      eventColor: '#a8a8a8',
      events: function(info, successCallback, failureCallback) {
        // let viewType: any = 'listMonth';
        const params: any = self.getParams({
          start: info.startStr,
          end: info.endStr,
          prevDate: true,
        });

        const { schoolId, classHash } = params;
        // const { schoolId, classHash, proof, work } = params;
        // const api = self.calendarComponent?.getApi();
        //
        // if ((proof || work) && api?.view.type !== 'listYear') {
        //   viewType = 'listYear';
        //   self.setCalendarView(viewType);
        //   return;
        // } else if (api?.view.type === 'listYear') {
        //   viewType = 'listMonth';
        //   self.setCalendarView(viewType);
        //   return;
        // }


        const setData = (data: any[], force?: boolean) => {
          if (force) {
            self.originalData = Object.assign([], data || []);
            if (self.public && self.originalData.length) {
              return setData(self.filterOriginal());
            }
          }
          // if (!data.length && !self.originalData.length) {
          //   return;
          // }
          successCallback(data);
          self.isLoading.set(false);
          self.cdr.markForCheck();
          self.cdr.detectChanges();
        }
        if (!schoolId && !classHash) {
          return setData([] as any[]);
        }

        const request$ = self.getRequest(params);

        if (!request$) {
          return setData(self.filterOriginal());
        }

        request$.subscribe({
          next: (value: LiteEvent[]) => {
            const data: EventInput[] = [];
            (value || []).forEach(
              (event: LiteEvent, index: number) => {
                const item: EventInput = {};
                const {
                  schoolId, lessonId, classId, timeScheduleId, date, classCode, curricularComponentName,
                  teacherName, countActivities, startTime, endTime
                } = event;
                let title: string[] = [];
                const school = self.filters.get('school')?.value as School | undefined;
                const hasFilterSchool = !!school?.id;
                const hasFilterClass = !!self.filters.get('schoolClass')?.value?.id;
                const hasFilterTeacher = !!self.filters.get('teacher')?.value?.id;
                if (lessonId) {
                  const num = ['⓪', '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨'];
                  if (school?.acronym && !hasFilterSchool && self.schools.length > 1) title.push(school.acronym);
                  if (classCode && !hasFilterClass) title.push(classCode);
                  if (curricularComponentName) title.push(curricularComponentName);
                  if (teacherName && !hasFilterTeacher) title.push(teacherName);
                  if (countActivities?.total) title.push(num[countActivities.total] || `(${countActivities.total})`);
                }
                item.title = title.join(' - ');

                item.start = new Date(`${date}T${startTime}`);
                item.end = new Date(`${date}T${endTime}`);
                item.id = `${schoolId}|${lessonId}|${classId}|${timeScheduleId}|${date}`;

                const statuses = [event.testStatus, event.workStatus];
                const status = ['REJECTED', 'PENDING_APPROVAL', 'APPROVED'].find(status => statuses.includes(status));

                if (status === 'APPROVED') {
                  if (event.testId) {
                    item.className = `${item.className || ''} event-activity-test`;
                  }
                  if (event.testType) {
                    item.className = `${item.className || ''} activity-type-${event.testType.toLowerCase()}`;
                  }
                  if (event.workId) {
                    item.className = `${item.className || ''} event-activity-work`;
                  }
                }
                else if (status) {
                  item.className = `${item.className || ''} activity-status-${self.proofStatusClass[status]}`;
                }

                item.extendedProps = {
                  ...event
                }

                data.push(item);
                return;
              }
            );
            setData(data, true);
          },
          error: (err: Error) => {
            failureCallback(err);
          }
        })
      },
      loading: (isLoading) => {
        console.log('Loading state changed:', isLoading);
        if (!isLoading) {
          // isLoading passa para 'false' quando todos os eventos são renderizados
          console.log('Todos os eventos foram renderizados');
        }
        self.fcLoading(isLoading);
      },
      ...this.calendarOptionsForm.value
    }
  })();

  handleDateSelect(selectInfo: DateSelectArg) {
    if (this.public) {
      return;
    }
    // this.addNewEvent();
  }


  applyFilter() {
    const filters = this.filters.getRawValue();
    const { test, work } = filters?.activities || {};
    const currentView = this.calendarComponent?.getApi()?.view.type;

    if ((test || work) && currentView === 'listMonth') {
      this.setCalendarView('listYear');
      return;
    } else if (test === false && work === false && currentView === 'listYear') {
      this.setCalendarView('listMonth');
    }

    this.refresh();
  }

  private _filter(val: Partial<EventInput & LiteEvent>): boolean {
    let item: LiteEvent;
    if (val.extendedProps) {
      item = val.extendedProps as LiteEvent;
    }
    else {
      item = val as LiteEvent;
    }
    if (!item) {
      return false;
    }

    const filters = this.filters.value as {
      activities: { test: boolean, work: boolean },
      group: Record<string, boolean>,
      school: { id: number, name: string, acronym: string },
      teacher: { id: number, fullName: string, email: string, cc: { id: number, name: string } },
      schoolClass: {
        id: null, year: null, suffix: null, dayShift: null,
        school: { id: number, name: string, acronym: string },
      }
    };

    const { schoolId, classId, teacherId, testId, workId, testStatus, workStatus, curricularComponentId } = item || {} as LiteEvent;

    /** exclusive **/

    if (!this.classHash) {
      if (filters.school?.id && schoolId !== filters.school.id) {
        return false;
      }

      if (filters.schoolClass?.id && classId !== filters.schoolClass.id) {
        return false;
      }
    }

    if (filters.teacher?.id && teacherId !== filters.teacher?.id) {
      return false;
    }

    if (filters.teacher?.cc?.id && curricularComponentId !== filters.teacher?.cc?.id) {
      return false;
    }

    /** inclusive **/
    const hasActivity = !!(testId || workId);

    if (hasActivity) {
      if (
        (filters.activities.test && testId)
        || (filters.activities.work && workId)
      ) {
        if (this.public) {
          return [testStatus, workStatus].includes('APPROVED');
        }
        return true;
      }
      // return true;
    }

    if ((!item.groupId && filters.group['lesson']) || filters.group[(item.groupId || '').toLowerCase()]) {
      return true;
    }

    return false;
  }

  handleEventClick(clickInfo: EventClickArg) {
    this.eventClick(clickInfo);
  }

  eventClick(row: EventClickArg) {
    if (!row.event.groupId || row.event.groupId === 'LESSON') {
      this.openLessonEventDialog(row);
      return;
    }
    this.openEventDialog(row);
  }

  openLessonEventDialog(row: EventClickArg) {
    const event = row.event.extendedProps as LiteEvent;
    const lessonId: number = event.lessonId || 0;
    this.lesEventService.setParams({lessonId: lessonId});

    const dialogRef = this.dialog.open(LessonEventFormDialogComponent, {
      data: {
        item: {
          ...event,
          date: row.event.start?.toISOString()
        },
        date: event.date,
        lessonId,
        classHash: this.classHash,
        timeScheduleId: event.timeScheduleId || 0,
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
