import {
  ChangeDetectorRef,
  Component,
  effect,
  HostListener,
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
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom, Subject, take, takeUntil } from 'rxjs';
import { Frequency, LessonBatch, SchoolClass, TimeSchedule } from '@models';
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
import { Textarea } from '@ui/field/textarea/textarea';

export type GridLessonItem = {
  lesson: LessonBatch,
  frequencyId?: number,
  x: number,
  y: number
}

@Component({
  selector: 'app-grid-lesson',
  imports: [Gridster, GridsterItem, ClassSelectComponent, ReactiveFormsModule, TranslatePipe, Button, MatIcon, MatIconButton, MatTooltip, ModalComponent, MatDialogActions, MatDialogContent, MatDialogTitle, Textarea],
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
  gridLessonsKey = 'gridLessons';
  options!: GridsterConfig;
  dashboard: GridsterItemConfig[] = [];
  protected localDashboard = signal<GridsterItemConfig[]>([]);
  school = this.auth.school;
  user = this.auth.user$.value;
  schedules = signal<TimeSchedule[]>([]);
  gridLessons: GridLessonItem[][] = [];
  timeSchedules: TimeSchedule[] = [];
  classControl = new FormControl();
  destroy$ = new Subject<void>();
  weekdays = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

  constructor() {
    effect(() => {
      const school = this.school();
      if (school.id && school.id !== this.classControl.value?.schoolId) {
        this.classControl.reset();
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
    else if (localClass?.code && localClass.code !== this.classControl.value?.code) {
      this.classControl.setValue(localClass, { emitEvent: false });
      return localClass;
    }

    return null;
  }

  edit(itemConfig: GridsterItemConfig, item: GridsterItem) {
    const data: GridLessonItem = itemConfig['data'];
    const lesson: LessonBatch = data ? data.lesson : new LessonBatch();
    const frequency = new Frequency();
    frequency.id = data.frequencyId || 0;
    frequency.weekday = this.weekdays[itemConfig.x];
    frequency.timeSchedule = this.schedules()[itemConfig.y];
    lesson.frequencies = [frequency];

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

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.submit) {
        Object.assign(itemConfig['data']?.lesson, result.value);
        this.localSave();
      }
    });
  }

  save() {
    // TODO: implementar
    this.store.remove(this.gridLessonsKey);
  }

  cancel(callback?: () => void) {
    this.store.remove(this.gridLessonsKey);
    this.dashboard = [];
    this.gridLessons = [];
    this.localDashboard.set([]);
    this.schedules.set([]);
    this.classControl.setValue(null, { emitEvent: false });
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
    let classCode = lessons?.[0]?.schoolClass?.code || '';
    this.setSchedules(classCode);
    if (this.schedules().length) {
      (lessons || []).forEach((lesson: LessonBatch) => {
        lesson.frequencies.forEach(frequency => {
          const x = this.weekdays.findIndex(day => day === frequency.weekday);
          const y = this.schedules().findIndex(schedule => schedule.id === frequency.timeSchedule?.id);
          if (!gridLessons[x]) { gridLessons[x] = [] as GridLessonItem[] }
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

  filter(schoolClass: SchoolClass) {
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
    this.setSchedules(schoolClass?.code || '');
    const params = schoolClass?.code ? { classCode: schoolClass.code } : {};
    this.lessonsService.getAll(params).pipe(takeUntil(this.destroy$)).subscribe(lessons => {
      this.setToGridLessons(lessons);
    })
  }

  setSchedules(classCode: string) {
    const { degreeId, dayShiftId } = Util.classCodeSplit(classCode);
    const schedules = this.timeSchedules.filter(timeSchedule => {
      return timeSchedule.dayShiftId === dayShiftId && timeSchedule.degreeId === degreeId;
    })
    this.schedules.set(schedules);
  }

  async setTimeSchedules() {
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
