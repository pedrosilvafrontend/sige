import { ChangeDetectorRef, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { AuthService, EventService, LessonStateService } from '@services';
import { DatePipe, NgStyle } from '@angular/common';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable
} from '@angular/material/table';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { MatMenu, MatMenuContent, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatRipple } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatTooltip } from '@angular/material/tooltip';
import { PageHeaderComponent } from '@ui/page-header/page-header.component';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom, takeUntil } from 'rxjs';
import { LesEvent } from '@modules/lessons/lesson-events/index';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EventDialogComponent } from '@modules/calendar/dialogs/event-dialog/event-dialog.component';
import { BaseListComponent } from '@modules/common/base/base-list.component';
import {
  LessonEventFormDialogComponent
} from '@modules/lessons/dialogs/lesson-event-form-dialog/lesson-event-form-dialog.component';
import { Calendar } from '@modules/calendar/calendar.model';
import { MatCheckbox } from '@angular/material/checkbox';
import { Button } from '@ui/button/button';
import { Activity, LessonBatch, LessonEvent } from '@models';
import { LessonEventService } from '@services/lesson-event.service';
import { UpdateService } from '@services/update.service';
import { map } from 'rxjs/operators';
import { ActivityService } from '@modules/config/activity/activity.service';

@Component({
  selector: 'app-lesson-events',
  standalone: true,
  imports: [
    MatProgressSpinner,
    DatePipe,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatFormField,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatMenu,
    MatMenuContent,
    MatMenuItem,
    MatPaginator,
    MatRipple,
    MatRow,
    MatRowDef,
    MatSort,
    MatSortHeader,
    MatSuffix,
    MatTable,
    MatTooltip,
    PageHeaderComponent,
    TranslateModule,
    FormsModule,
    MatMenuTrigger,
    MatHeaderCellDef,
    MatButton,
    MatCheckbox,
    ReactiveFormsModule,
    Button,
    NgStyle
  ],
  providers: [
    TranslatePipe
  ],
  templateUrl: './lesson-events.component.html',
  styleUrl: './lesson-events.component.scss'
})
export class LessonEventsComponent extends BaseListComponent<LessonEvent> implements OnInit, OnDestroy {
  private lessonEventService = inject(LessonEventService);
  private eventService = inject(EventService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  private lessonStateService = inject(LessonStateService);
  private cdr = inject(ChangeDetectorRef);
  private translatePipe = inject(TranslatePipe);
  private auth = inject(AuthService);
  private updateService = inject(UpdateService);
  private activityService = inject(ActivityService);
  public authRole: string = '';
  public activities: Map<string, Activity> = new Map();
  public lesson!: LessonBatch;
  public lessonId: number = 0;
  public eventCategories: string[] = [];
  public lessonBatch = this.lessonStateService.getSelectedLesson();
  public now = new Date().toISOString();
  // public prevDate: FormControl<boolean | null> = new FormControl<boolean>(false);
  public fb = new FormBuilder();
  public params = this.fb.group({
    prevDate: false
  })

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('filter') filter!: ElementRef;
  @ViewChild(MatMenuTrigger) contextMenu?: MatMenuTrigger;

  constructor() {
    super();
    this.columnsLabels = ['title', 'date', 'time', 'evalTools', 'actions'];
  }

  addNew() {
    this.openLesEventDialog();
  }

  editCall(row: LessonEvent) {
    this.openLesEventDialog(row);
  }

  // eventList(row: Lesson) {
  //   this.router.navigate([`/lessons/${row.id}/lesson-events`]).then();
  // }

  applyFilter(event: Event) {
    this.dataSource.filter = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
  }

  getDisplayedColumns(): string[] {
    return this.columnDefinitions
      .filter((cd) => cd.visible)
      .map((cd) => cd.def);
  }

  openLesEventDialog(item?: any) {
    const action = 'edit';
    const dialogRef = this.dialog.open(LessonEventFormDialogComponent, {
      data: {
        item,
        action,
      },
      autoFocus: false,
      disableClose: true,
      width: '1000px',
      maxWidth: '100vw',
    });

    dialogRef.afterClosed().subscribe((result) => {
      const text = 'Salvo com sucesso!';
      if (result) {
        this.showNotification(
          'bg-green-500',
          text,
        );
        this.loadData().then();
      }
    });
  }

  openLessonBatchDialog() {
    // const lessonBatch = this.lessonBatch();
    // if (!lessonBatch) {
    //   return;
    // }
    const eventData = new Calendar({
      // title: lessonBatch?.title,
      groupId: 'LESSON',
      // lesson: lessonBatch || null
    } as Calendar);
    const dialogRef = this.dialog.open(EventDialogComponent, {
      data: {
        lessonId: this.lessonId,
        calendar: eventData,
        action: 'edit',
        categories: this.eventCategories || [],
      },
      autoFocus: false,
      disableClose: true,
      width: '800px',
      maxWidth: '100vw',
    });

    dialogRef.afterClosed().subscribe((action) => {

      if (action === 'delete') {
        // this.deleteItem(eventData);
      }

      // if (action === 'submit') {
      //   this.showNotification(
      //     'snackbar-success',
      //     'Salvo com sucesso!',
      //   );
      // }
    });
  }

  deleteItem(row: LesEvent) {
    // const dialogRef = this.dialog.open(LessonsDialogComponent, { data: row, disableClose: true });
    // dialogRef.afterClosed().subscribe((result) => {
    //   if (result) {
    //     this.dataSource.data = this.dataSource.data.filter(
    //       (record) => record.id !== row.id
    //     );
    //     this.refreshTable();
    //     this.showNotification(
    //       'snackbar-danger',
    //       'Excluído com sucesso',
    //       'bottom',
    //       'center'
    //     );
    //   }
    // });
  }

  private refreshTable() {
    this.paginator.pageIndex = 0;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  isAllSelected() {
    return this.selection.selected.length === this.dataSource.data.length;
  }

  masterToggle() {
    return this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  loadPrevDate() {
    this.params.controls.prevDate.setValue(true);
    this.loadData().then();
  }

  async loadData(params?: any) {
    const routeParams = await firstValueFrom(this.route.params);
    const getParams = {
      ...this.params.value,
      ...routeParams,
      ...(params || {})
    };
    this.dataSource.data = await firstValueFrom(this.lessonEventService.getAll(getParams));
    this.refreshTable();
    this.dataSource.filterPredicate = (
      data: LessonEvent,
      filter: string
    ) => {
      return Object.values(data).some((value: any) =>
        value.toString().toLowerCase().includes(filter)
      );
    }
    this.cdr.detectChanges();
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

  exportExcel() {
    // const [curricularComponent, classe, dayShift, teacher, school] = this.columnsLabels;
    const exportData = this.dataSource.filteredData.map((x) => ({
      // [curricularComponent]: x.curricularComponent?.name,
      // [classe]: (x.class?.year?.name || '') + (x.class?.suffix?.name || ''),
      // [dayShift]: x.class?.dayShift?.name,
      // [teacher]: (x.teacher?.fullName || '')+' '+(x.teacher?.lastName || ''),
      // [school]: (x.school?.acronym || '')+' '+(x.school?.name || '')
    }));

    // TableExportUtil.exportToExcel(exportData as any, 'excel');
  }

  onContextMenu(event: MouseEvent, item: LesEvent) {
    event.preventDefault();
    this.contextMenuPosition = {
      x: `${event.clientX}px`,
      y: `${event.clientY}px`,
    };
    if (this.contextMenu) {
      this.contextMenu.menuData = { item };
      this.contextMenu.menu?.focusFirstItem('mouse');
      this.contextMenu.openMenu();
    }
  }

  async loadEventCategories() {
    this.eventCategories = await firstValueFrom(this.eventService.getEventCategories());
  }

  async ngOnInit() {
    this.authRole = this.auth.user$.value.role || '';

    // if (!this.lessonBatch()) {
    //   this.router.navigate(['/lessons']).then();
    //   return;
    // }

    this.loading = true;
    const tmo = setTimeout(() => {
      this.loading = false;
    }, 7000)
    await this.loadEventCategories();
    // await this.loadParams();
    // await this.loadData();
    this.loading = false;
    clearTimeout(tmo);
    this.observeRouteParams();

    this.updateService.proof$.pipe(takeUntil(this.destroy$)).subscribe((proof) => {
      if (proof) {
        this.loadData({ lessonId: this.lessonId }).then();
      }
    });

    this.activities = await this.activityService.getMap();
  }

  observeRouteParams() {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params: ParamMap) => {
      const lessonId = params.get('lessonId');
      this.lessonId = lessonId ? parseInt(lessonId) : 0;
      if (lessonId) {
        this.loadData({ lessonId }).then()
      }
    });
  }

}
