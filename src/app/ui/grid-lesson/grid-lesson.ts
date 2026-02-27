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
import { ClassSelectComponent } from '@modules/classes/class-select/class-select.component';
import { AuthService, LessonsService, LocalStorageService } from '@services';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom, Subject, take, takeUntil } from 'rxjs';
import { Frequency, ILessonForm, LessonBatch, SchoolClass, TimeSchedule } from '@models';
import { TimeScheduleService } from '@services/time-schedule.service';
import { Util } from '@util/util';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from '@ui/button/button';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { LessonsFormDialogComponent } from '@modules/lessons';
import { MatDialog, MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { map } from 'rxjs/operators';
import { ModalComponent } from '@ui/modal/modal.component';
import { LessonsMap } from '@modules/lessons/lessons.map';
import Swal from 'sweetalert2';
import { NgClass } from '@angular/common';

export type GridLessonItem = {
  lesson: LessonBatch,
  frequencyId?: number,
  x: number,
  y: number
}

@Component({
  selector: 'app-grid-lesson',
  imports: [Gridster, GridsterItem, ClassSelectComponent, ReactiveFormsModule, TranslatePipe, Button, MatIcon, MatIconButton, MatTooltip, ModalComponent, MatDialogActions, MatDialogContent, MatDialogTitle, NgClass],
  templateUrl: './grid-lesson.html',
  styleUrl: './grid-lesson.scss',
  encapsulation: ViewEncapsulation.None,
})
export class GridLesson implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private lessonsService = inject(LessonsService);
  private timeService = inject(TimeScheduleService);
  private dialog = inject(MatDialog);
  private store = inject(LocalStorageService);
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
  classControl = new FormControl();
  destroy$ = new Subject<void>();
  weekdays = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
  conflicts: string[] = [];

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
      // if (this.localDashboard()) {
      //   this.setClassByLocal();
      //   this.dashboard = this.localDashboard();
      // }
    });
  }

  setClassByLocal(): SchoolClass | null {
    const localGrid = this.localDashboard();
    if (!localGrid || !localGrid.length) {
      return null;
    }
    const itemConfig = localGrid.find(
      (item) => !!item['data']?.lesson?.curricularComponent?.id);
    if (!itemConfig) {
      return null;
    }
    const lesson = itemConfig['data']?.lesson;
    if (!lesson) {
      return null;
    }
    const schoolId = this.school()?.id;
    const localClass = lesson.schoolClass;
    const localSchoolId = lesson.school?.id;

    if (schoolId && localSchoolId && localSchoolId !== schoolId) {
      this.classControl.setValue(null, { emitEvent: false });
      return null;
    }
    else if (localClass?.code) {
      this.classControl.setValue(localClass, { emitEvent: false });
      this.setLessonsByLocal(localClass.code).then();
      return localClass;
    }

    return null;
  }

  async setLessonsByLocal(classCode: string) {
    const localGrid = this.localDashboard();
    if (!classCode || !localGrid || !localGrid.length) {
      return;
    }
    this.lessons.clear();
    const lessons = await this.getLessons(classCode).then();
    (lessons || []).forEach((lesson: LessonBatch) => {
      this.setLesson(lesson);
    });
    (localGrid || []).forEach((item: GridsterItemConfig) => {
      const lesson = this.itemConfigToLesson(item);
      this.setLesson(lesson);
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

    dialogRef.componentInstance.lessonForm$.subscribe(({form}) => {
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
    let frequency = lesson.frequencies.find(f => f.weekday === weekday && f.timeSchedule?.id === timeSchedule?.id);
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
    // TODO: chave unica school, curricularComponent e teacher ids
    let dashboard = this.getLocalLessonsDashboard();
    if (dashboard.length) {
      const classCode = this.getClassCodeOnDashboard(dashboard);
      this.setSchedules(classCode || '');
      this.localDashboard.set(dashboard);
      this.dashboard = dashboard;
      return;
    }

    this.dashboard = [
      { cols: 1, rows: 1, y: 0, x: 0 },
      { cols: 1, rows: 1, y: 0, x: 1 },
      { cols: 1, rows: 1, y: 0, x: 2 },
      { cols: 1, rows: 1, y: 0, x: 3 },
      { cols: 1, rows: 1, y: 0, x: 4 },
      { cols: 1, rows: 1, y: 1, x: 0 },
      { cols: 1, rows: 1, y: 1, x: 1 },
      { cols: 1, rows: 1, y: 1, x: 2 },
      { cols: 1, rows: 1, y: 1, x: 3 },
      { cols: 1, rows: 1, y: 1, x: 4 },
      { cols: 1, rows: 1, y: 2, x: 0 },
      { cols: 1, rows: 1, y: 2, x: 1 },
      { cols: 1, rows: 1, y: 2, x: 2 },
      { cols: 1, rows: 1, y: 2, x: 3 },
      { cols: 1, rows: 1, y: 2, x: 4 },
      { cols: 1, rows: 1, y: 3, x: 0 },
      { cols: 1, rows: 1, y: 3, x: 1 },
      { cols: 1, rows: 1, y: 3, x: 2 },
      { cols: 1, rows: 1, y: 3, x: 3 },
      { cols: 1, rows: 1, y: 3, x: 4 },
      { cols: 1, rows: 1, y: 4, x: 0 },
      { cols: 1, rows: 1, y: 4, x: 1 },
      { cols: 1, rows: 1, y: 4, x: 2 },
      { cols: 1, rows: 1, y: 4, x: 3 },
      { cols: 1, rows: 1, y: 4, x: 4 },
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
      maxRows: 5,
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
        enabled: true,
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
    const classCode = this.classControl.value?.code || '';
    this.lessons.clear();
    this.setSchedules(classCode);
    if (this.schedules().length) {
      (lessons || []).forEach((lesson: LessonBatch) => {
        this.setLesson(lesson);
        const frequencies = lesson.frequencies || [];
        frequencies.forEach(frequency => {
          if (lesson.schoolClass?.code !== classCode) {
            return;
          }
          const x = this.weekdays.findIndex(day => day === frequency.weekday);
          const y = this.schedules().findIndex(schedule => schedule.id === frequency.timeSchedule?.id);
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

  async filter(schoolClass: SchoolClass) {
    if (this.localDashboard().length) {
      this.setClassByLocal();
      return;
    }
    if (!schoolClass) {
      return;
    }
    // const validLocalClass = this.setClassByLocal();
    // if (validLocalClass) {
    //   schoolClass = validLocalClass;
    // }
    const lessons = await this.getLessons(schoolClass.code);
    this.setSchedules(schoolClass?.code || '');
    this.setToGridLessons(lessons);

    // const params = schoolClass?.code ? { classCode: schoolClass.code } : {};
    // this.lessonsService.getAll(params).pipe(takeUntil(this.destroy$)).subscribe(lessons => {
    //   this.setToGridLessons(lessons);
    // })
  }

  async getLessons(classCode?: string | null): Promise<LessonBatch[]> {
    if (!classCode) {return [] as LessonBatch[];}
    const params = { classCode };
    const lessons = await firstValueFrom(this.lessonsService.getAll(params));
    this.originalLessons = Object.assign([], lessons);
    return lessons;
  }

  setSchedules(classCode: string) {
    const { degreeId, dayShiftId } = Util.classCodeSplit(classCode);
    const schedules = this.timeSchedules.filter(timeSchedule => {
      return timeSchedule.dayShiftId === dayShiftId && timeSchedule.degreeId === degreeId;
    })
    this.schedules.set(schedules);
  }

  async setTimeSchedules() {
    if (!this.school()?.id) {
      return;
    }
    const request$ = this.timeService.getAll({schoolId: this.school()?.id})
      .pipe(
        take(1),
        map((data: any) => {
          this.timeSchedules = data || [];
        })
      );

    return firstValueFrom(request$);
  }

  async ngOnInit() {
    await this.setTimeSchedules();
    // this.store.storageChange$.pipe(takeUntil(this.destroy$)).subscribe((event: StorageEvent) => {
    //   if (event.key === this.gridLessonsKey) {
    //     // let dashboard: GridsterItemConfig[] = JSON.parse(event.newValue || '[]');
    //     // if (!Array.isArray(dashboard)) {
    //     //   dashboard = [];
    //     // }
    //     // this.localDashboard.set(dashboard);
    //     // this.dashboard = dashboard;
    //     this.setDashboard();
    //   }
    // })
    this.setDashboard();
    this.options = this.getOptions();
    this.setClassByLocal();

    this.classControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(this.filter.bind(this))
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
