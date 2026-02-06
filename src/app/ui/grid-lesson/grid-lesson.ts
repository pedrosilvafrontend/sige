import { Component, effect, inject, input, OnDestroy, OnInit, signal, ViewEncapsulation } from '@angular/core';
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
import { AuthService, LessonsService } from '@services';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Frequency, LessonBatch, SchoolClass, TimeSchedule } from '@models';
import { TimeScheduleService } from '@services/time-schedule.service';
import { Util } from '@util/util';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from '@ui/button/button';
import { JsonPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { LessonsFormDialogComponent } from '@modules/lessons';
import { MatDialog } from '@angular/material/dialog';

export type GridLessonItem = {
  lesson: LessonBatch,
  frequencyId?: number,
  x: number,
  y: number
}

@Component({
  selector: 'app-grid-lesson',
  imports: [Gridster, GridsterItem, ClassSelectComponent, ReactiveFormsModule, TranslatePipe, Button, MatIcon, MatIconButton, MatTooltip],
  templateUrl: './grid-lesson.html',
  styleUrl: './grid-lesson.scss',
  encapsulation: ViewEncapsulation.None,
})
export class GridLesson implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private lessonsService = inject(LessonsService);
  private timeService = inject(TimeScheduleService);
  private dialog = inject(MatDialog);
  options!: GridsterConfig;
  dashboard: Array<GridsterItemConfig> = [];
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
      if (this.school()) {
        this.setSchedules(this.classControl.value);
      }
    });
  }

  edit(item: GridsterItemConfig) {
    const data: GridLessonItem = item['data'];
    const lesson: LessonBatch = data ? data.lesson : new LessonBatch();
    const frequency = new Frequency();
    frequency.id = data.frequencyId || 0;
    frequency.weekday = this.weekdays[item.x];
    frequency.timeSchedule = this.schedules()[item.y];
    lesson.frequencies = [frequency];

    if (!lesson.schoolClass?.id) {
      lesson.schoolClass = this.classControl.value;
    }

    const action = lesson.id ? 'edit' : 'add';
    const dialogRef = this.dialog.open(LessonsFormDialogComponent, {
      width: '99vw',
      maxWidth: '1024px',
      data: { table: lesson, action, blockSubmit: true },
      autoFocus: false,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.submit) {
        console.log('The dialog was closed', result.value);
        Object.assign(item['data']?.lesson, result.value);
      }
    });
  }

  save() {
  }

  setDashboard(): void {
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

  tempItem: GridsterItemConfig | null = null;

  itemChange(itemConfig: GridsterItemConfig, item: GridsterItem) {
    if (!this.tempItem) {
      this.tempItem = itemConfig;
      return;
    }
    const itemA = this.tempItem;
    const itemB = itemConfig;
    this.tempItem = null;
    console.log('itemChange Callback', arguments);
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
      background: 'transparent',
    };
  }

  filter(schoolClass: SchoolClass) {
    const params = schoolClass.code ? { classCode: schoolClass.code } : {};
    this.lessonsService.getAll(params).pipe(takeUntil(this.destroy$)).subscribe(lessons => {
      this.setSchedules(schoolClass.code || '');
      const gridLessons: GridLessonItem[][] = [];
      (lessons || []).forEach((lesson: LessonBatch, index: number) => {
        lesson.frequencies.forEach(frequency => {
          const x = this.weekdays.findIndex(day => day === frequency.weekday);
          const y = this.schedules().findIndex(schedule => schedule.id === frequency.timeSchedule?.id);
          if (!gridLessons[x]) { gridLessons[x] = [] as GridLessonItem[] }
          gridLessons[x][y] = { lesson, frequencyId: frequency.id, x, y }
        })
      })
      this.gridLessons = gridLessons;
      this.setDashboard();
    })
  }

  setSchedules(classCode: string) {
    const { degreeId, dayShiftId } = Util.classCodeSplit(classCode);
    const schedules = this.timeSchedules.filter(timeSchedule => {
      return timeSchedule.dayShiftId === dayShiftId && timeSchedule.degreeId === degreeId;
    })
    this.schedules.set(schedules);
  }

  ngOnInit(): void {
    this.options = this.getOptions();
    // this.dashboard = this.getData();

    this.timeService.getAll({schoolId: this.school()?.id}).pipe(takeUntil(this.destroy$)).subscribe(
      (data: any) => {
        this.timeSchedules = data || [];
      }
    )

    this.classControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(this.filter.bind(this))
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
