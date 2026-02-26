import {
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewEncapsulation
} from '@angular/core';
import {
  CompactType,
  DisplayGrid,
  Gridster,
  GridsterConfig,
  GridsterItem,
  GridsterItemConfig,
  GridType
} from 'angular-gridster2';
import { AuthService, LessonsService, LocalStorageService } from '@services';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { Degree, Frequency, ILessonForm, LessonBatch, SchoolClass, TimeSchedule } from '@models';
import { TimeScheduleService } from '@services/time-schedule.service';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from '@ui/button/button';
import { LessonsFormDialogComponent } from '@modules/lessons';
import { MatDialog, MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { ModalComponent } from '@ui/modal/modal.component';
import { LessonsMap } from '@modules/lessons/lessons.map';
import Swal from 'sweetalert2';
import { NgClass } from '@angular/common';
import { DegreesService } from '@services/degrees.service';

export type GridLessonItem = {
  lesson: LessonBatch,
  frequencyId?: number,
  x: number,
  y: number
}

@Component({
  selector: 'app-grid-teacher-lesson',
  imports: [Gridster, GridsterItem, ReactiveFormsModule, TranslatePipe, Button, ModalComponent, MatDialogActions, MatDialogContent, MatDialogTitle, NgClass],
  templateUrl: './grid-teacher-lesson.html',
  styleUrl: './grid-teacher-lesson.scss',
  encapsulation: ViewEncapsulation.None,
})
export class GridTeacherLesson implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private lessonsService = inject(LessonsService);
  private timeService = inject(TimeScheduleService);
  private dialog = inject(MatDialog);
  private store = inject(LocalStorageService);
  private degreesService = inject(DegreesService);
  private cdr = inject(ChangeDetectorRef);
  private originalLessons: LessonBatch[] = [];
  gridLessonsKey = 'gridLessons';
  options!: GridsterConfig;
  dashboard: GridsterItemConfig[] = [];
  protected localDashboard = signal<GridsterItemConfig[]>([]);
  school = this.auth.school;
  user = this.auth.user$.value;
  schedules = signal<TimeSchedule[]>([]);
  gridLessons: GridLessonItem[][] = [];
  lessons = new LessonsMap();
  timeSchedules: TimeSchedule[] = [];
  timeMap: Map<string, GridsterConfig> = new Map();
  classControl = new FormControl();
  destroy$ = new Subject<void>();
  weekdays = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
  conflicts: string[] = [];
  degrees: Degree[] = [];
  fb: FormBuilder = inject(FormBuilder);
  form = this.fb.group({
    degreeId: [null, [Validators.required]],
  });
  multiSchools = (this.user.schools?.length || 0) > 1;

  constructor() {
    effect(() => {
      const school = this.school();
      if (school?.id) {
        if (school.id !== this.classControl.value?.schoolId) {
          this.classControl.reset();
        }
        if (this.timeSchedules.length === 0) {
          this.setTimeSchedules().then();
        }
      }
    });
  }

  itemConfigToLesson(itemConfig: GridsterItemConfig): LessonBatch {
    const data: GridLessonItem = itemConfig['data'];
    let lesson: LessonBatch = data?.lesson ? data.lesson : new LessonBatch();
    if (!lesson.schoolClass?.id) {
      lesson.schoolClass = this.classControl.value;
    }
    lesson.frequencies = [this.getItemFrequency(itemConfig)];
    return lesson;
  }

  edit(itemConfig: GridsterItemConfig, item: GridsterItem) {
    const empty = !itemConfig['data']?.lesson?.curricularComponent?.name;
    if (empty) {
      return;
    }
    const lesson: LessonBatch = this.itemConfigToLesson(itemConfig);

    if (!lesson.schoolClass?.id) {
      lesson.schoolClass = this.classControl.value;
    }

    const action = lesson.id ? 'edit' : 'add';
    const dialogRef = this.dialog.open(LessonsFormDialogComponent, {
      width: '99vw',
      maxWidth: '1024px',
      data: { table: lesson, action, origin: 'grid' },
      autoFocus: false,
      disableClose: true
    });

    const patchLesson = (form: FormGroup<ILessonForm>) => {
      let lesson = form.getRawValue();
      if (lesson.curricularComponent?.id && lesson.teacher?.id) {
        let existingLesson = this.lessons.getLesson(lesson as any);
        if (existingLesson) {
          form.patchValue({...existingLesson, frequencies: []} as any, { emitEvent: false });
        }
        else {
          form.patchValue({id: 0} as any, { emitEvent: false });
        }
      }
      return null;
    }

    dialogRef.componentInstance.form$.subscribe(form => {
      form.get('curricularComponent')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
        patchLesson(form);
      })
      form.get('teacher')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
        patchLesson(form);
      })
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.submit) {
        const lesson = this.setLesson(result.value);
        if (itemConfig['data']?.lesson) {
          itemConfig['data'].lesson = lesson;
        }
        this.localSave();
      }
    });
  }

  setLesson(lesson: LessonBatch) {
    lesson = Object.assign(new LessonBatch(), lesson);
    const originalLesson = this.originalLessons.find(l => {
      return (
        l.curricularComponent?.id && l.curricularComponent.id === lesson.curricularComponent?.id
        && l.teacher?.id && l.teacher.id === lesson.teacher?.id
      );
    });

    if (originalLesson) {
      lesson.id = originalLesson.id;
    }

    return this.lessons.setLesson(lesson);
  }

  async save(force = false) {
    this.lessons.clear();
    this.dashboard.forEach(item => {
      this.setLesson(this.itemConfigToLesson(item));
    })

    const lessons: LessonBatch[] = this.lessons.list;
    console.log('save', lessons);

    if (!force) {
      const conflicts = (await firstValueFrom(this.lessonsService.conflicts(lessons))) || [];
      if (conflicts.length) {
        Swal.fire("Há conflito de horários", "", "error").then();
        this.setConflicts(conflicts);
        this.cdr.detectChanges();
        return;
      }
    }

    this.lessonsService.saveBatch(lessons).subscribe(lessons => {
      Swal.fire("Salvo com sucesso", "", "success").then(r => {
        this.reset(true);
      });
    })
  }

  getItemFrequency(item: GridsterItemConfig) {
    const lesson: LessonBatch = item['data']?.lesson;
    const weekday = this.weekdays[item.x];
    const timeSchedule = this.schedules()[item.y];
    let frequency = lesson.frequencies.find(f => f.weekday === weekday && this.tsKey(f.timeSchedule) === this.tsKey(timeSchedule));
    if (!frequency) {
      frequency = new Frequency();
      frequency.weekday = weekday;
      frequency.timeSchedule = timeSchedule;
    }
    return frequency;
  }

  setConflicts(conflicts: Frequency[]) {
    const key = (frequency: Frequency) => `${frequency.weekday}|${frequency.timeSchedule?.id}`;
    const weekTimes = conflicts.map(key);
    this.conflicts.length = 0;
    this.dashboard.forEach(item => {
      const lesson: LessonBatch = item['data']?.lesson;
      if (!lesson) {
        return;
      }
      lesson.frequencies = [this.getItemFrequency(item)];
      const [frequency] = lesson.frequencies;
      item['conflict'] = frequency && weekTimes.includes(key(frequency));
      if (item['conflict']) {
        this.conflicts.push(`${item.x}|${item.y}`);
      }
    })
  }

  async checkConflicts() {
    const lessons: LessonBatch[] = this.lessons.list;
    const conflicts = (await firstValueFrom(this.lessonsService.conflicts(lessons))) || [];
    if (conflicts.length) {
      Swal.fire("Há conflito de horários", "", "error").then();
      this.setConflicts(conflicts);
      this.cdr.detectChanges();
      return;
    }
  }

  reset(refresh = false, callback?: () => void) {
    this.store.remove(this.gridLessonsKey);
    this.dashboard = [];
    this.gridLessons = [];
    this.conflicts = [];
    this.lessons.clear();
    this.localDashboard.set([]);
    this.schedules.set([]);
    if (refresh) {
      this.filter(this.classControl.value).then();
    }
    else {
      this.classControl.setValue(null, { emitEvent: false });
    }
    callback?.();
    this.cdr.detectChanges();
  }

  getLocalLessonsDashboard(): GridsterItemConfig[] {
    const localGrid = this.store.get(this.gridLessonsKey);
    if (localGrid && Array.isArray(localGrid)) {
      return localGrid as GridsterItemConfig[];
    }
    return [] as GridsterItemConfig[];
  }

  localSave() {
    this.store.set(this.gridLessonsKey, this.dashboard);
    this.localDashboard.set(this.dashboard);
    this.cdr.detectChanges();
  }

  setDashboard(): void {
    const numX = 5;
    const maxY = this.schedules().length;

    const items: GridsterItemConfig[] = [
      ...new Array(maxY).fill(0).reduce((acc, _, y) => {
        const newItems = new Array(numX).fill(0).map((_, x) => ({ cols: 1, rows: 1, y, x }));
        acc.push(...newItems);
        return acc;
      }, []),
    ];

    this.dashboard = [
      ...items,
    ].map((item) => {
      const gridLesson = this.gridLessons[item.x]?.[item.y] || { lesson: new LessonBatch(), x: item.x, y: item.y };
      return {...item, data: gridLesson};
    })
  }

  itemChange(itemConfig: GridsterItemConfig, item: GridsterItem) {
    console.log('itemChange Callback', arguments);
    itemConfig['conflict'] = false;
    if (this.conflicts.length) {
      this.conflicts.length = 0;
    }
    this.localSave();
  }

  getOptions(): GridsterConfig {
    return {
      itemChangeCallback: this.itemChange.bind(this),
      swapWhileDragging: false,
      gridType: GridType.Fit,
      compactType: CompactType.None,
      margin: 6,
      outerMargin: true,
      outerMarginTop: null,
      outerMarginRight: null,
      outerMarginBottom: null,
      outerMarginLeft: null,
      useTransformPositioning: true,
      mobileBreakpoint: 200,
      minCols: 5,
      maxCols: 5,
      minRows: 5,
      maxRows: this.schedules().length || 5,
      maxItemCols: 100,
      minItemCols: 1,
      maxItemRows: 100,
      minItemRows: 1,
      maxItemArea: 500,
      minItemArea: 1,
      defaultItemCols: 1,
      defaultItemRows: 1,
      fixedColWidth: 105,
      fixedRowHeight: 105,
      keepFixedHeightInMobile: false,
      keepFixedWidthInMobile: false,
      scrollSensitivity: 10,
      scrollSpeed: 20,
      enableEmptyCellClick: false,
      enableEmptyCellContextMenu: false,
      enableEmptyCellDrop: false,
      enableEmptyCellDrag: false,
      emptyCellDragMaxCols: 50,
      emptyCellDragMaxRows: 50,
      ignoreMarginInRow: false,
      draggable: {
        enabled: false,
      },
      resizable: {
        enabled: false,
      },
      swap: true,
      pushItems: true,
      disablePushOnDrag: true,
      disablePushOnResize: true,
      pushDirections: { north: true, east: true, south: true, west: true },
      pushResizeItems: false,
      displayGrid: DisplayGrid.None,
      disableWindowResize: false,
      disableWarnings: false,
      scrollToNewItems: false,
    };
  }

  setToGridLessons(lessons: LessonBatch[]) {
    const gridLessons: GridLessonItem[][] = [];
    this.lessons.clear();
    this.setSchedules();
    if (this.schedules().length) {
      (lessons || []).forEach((lesson: LessonBatch) => {
        this.setLesson(lesson);
        const frequencies = lesson.frequencies || [];
        frequencies.forEach(frequency => {
          const x = this.weekdays.findIndex(day => day === frequency.weekday);
          const y = this.schedules().findIndex(schedule => this.tsKey(schedule) === this.tsKey(frequency.timeSchedule));
          if (!gridLessons[x]) { gridLessons[x] = [] as GridLessonItem[] }
          lesson.frequencies = [frequency];
          gridLessons[x][y] = { lesson, frequencyId: frequency.id, x, y }
        })
      });
    }
    this.gridLessons = gridLessons;
    this.setDashboard();
  }

  getClassCodeOnDashboard(dashboard: GridsterItemConfig[]) {
    return dashboard.find(item => !!item['data']?.lesson?.curricularComponent?.id)?.['data']?.lesson?.schoolClass?.code;
  }

  async filter(teacherId: number) {
    if (!teacherId) {
      return;
    }
    const lessons = await this.getLessons(teacherId);
    this.setToGridLessons(lessons);
  }

  async getLessons(teacherId: number): Promise<LessonBatch[]> {
    if (!teacherId) {return [] as LessonBatch[];}
    const params = { teacherId };
    const lessons = await firstValueFrom(this.lessonsService.getAll(params));
    this.originalLessons = Object.assign([], lessons);
    return lessons;
  }

  setSchedules() {
    const times = this.timeSchedules.reduce((acc, ts) => {
      acc[this.tsKey(ts)] = new TimeSchedule({ startTime: ts.startTime, endTime: ts.endTime });
      return acc;
    }, {} as Record<string, TimeSchedule>);
    this.schedules.set(Object.values(times));
  }

  tsKey(timeSchedule?: TimeSchedule | null) {
    if (!timeSchedule) { return ''; }
    return `${timeSchedule.startTime}-${timeSchedule.endTime}`;
  }

  async setTimeSchedules() {
    if (!this.user?.id) {
      return;
    }
    this.timeSchedules = (await firstValueFrom(this.timeService.getByTeacher(this.user.id))) || [];
  }

  async ngOnInit() {
    this.degrees = await firstValueFrom(this.degreesService.getAll());
    await this.setTimeSchedules();
    this.setSchedules();

    this.setDashboard();
    this.options = this.getOptions();
    this.filter(this.user.id || 0);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
