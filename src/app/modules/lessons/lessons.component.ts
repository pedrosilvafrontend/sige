import { ChangeDetectorRef, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MAT_DATE_LOCALE, MatOptionModule, MatRippleModule } from '@angular/material/core';
import { PageHeaderComponent } from '@ui/page-header/page-header.component';
import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LessonsFormDialogComponent } from './dialogs/lessons-form-dialog/lessons-form-dialog.component';
import { AuthService, LessonsService } from '@services';
import { LessonsDialogComponent } from './dialogs/lessons-delete-dialog/lessons-delete.component';
import { Router } from '@angular/router';
import { LessonStateService } from '@services';
import { LessonBatch } from '@models';
import { Calendar } from '@modules/calendar/calendar.model';
import { EventDialogComponent } from '@modules/calendar/dialogs/event-dialog/event-dialog.component';
import { Util } from '@util/util';
import { GridLesson } from '@ui/grid-lesson/grid-lesson';
import { GridTeacherLesson } from '@ui/grid-teacher-lessons/grid-teacher-lesson';

@Component({
  selector: 'app-lessons',
  standalone: true,
  templateUrl: './lessons.component.html',
  styleUrl: './lessons.component.scss',
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }],
  imports: [
    PageHeaderComponent,
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatSelectModule,
    ReactiveFormsModule,
    FormsModule,
    MatOptionModule,
    MatCheckboxModule,
    MatTableModule,
    MatSortModule,
    NgClass,
    MatRippleModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatPaginatorModule,
    DatePipe,
    TranslateModule,
    GridLesson,
    GridTeacherLesson,
  ],
})
export class LessonsComponent implements OnInit, OnDestroy {
  private dialog = inject(MatDialog);
  private lessonService = inject(LessonsService);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private lessonStateService = inject(LessonStateService);
  private auth = inject(AuthService);
  user = this.auth.user$.value

  columnsLabels = ['curricularComponent', 'class', 'teacher', 'school',  'actions'].map((key: string) => this.translate.instant(key));

  columnDefinitions = (() => {
    const [curricularComponent, classe, teacher, school, actions] = this.columnsLabels;
    return [
      // { def: 'select', label: 'Checkbox', type: 'check', visible: true },
      { def: 'id', label: '#', type: 'text', visible: true },
      { def: 'curricularComponent', label: curricularComponent, type: 'text', visible: true },
      { def: 'schoolClass', label: classe, type: 'text', visible: true },
      { def: 'teacher', label: teacher, type: 'text', visible: true },
      { def: 'school', label: school, type: 'text', visible: true },
      { def: 'actions', label: actions, type: 'actionBtn', visible: true },
    ]
  })();

  dataSource = new MatTableDataSource<LessonBatch>([]);
  selection = new SelectionModel<LessonBatch>(true, []);
  contextMenuPosition = { x: '0px', y: '0px' };
  isLoading = true;
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('filter') filter!: ElementRef;
  @ViewChild(MatMenuTrigger) contextMenu?: MatMenuTrigger;

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  refresh() {
    this.loadData();
  }

  getDisplayedColumns(): string[] {
    return this.columnDefinitions
      .filter((cd) => cd.visible)
      .map((cd) => cd.def);
  }

  addNew() {
    this.openDialog('add');
  }

  goToEvents(row: LessonBatch) {
    // this.openDialog('edit', row);
    this.eventList(row);
  }

  eventList(row: LessonBatch) {
    this.lessonStateService.setSelectedLesson(row);
    this.router.navigate([`/lessons/${row.id}`]).then();
  }

  openDialog(action: 'add' | 'edit', data?: LessonBatch) {
    const dialogRef = this.dialog.open(LessonsFormDialogComponent, {
      width: '99vw',
      maxWidth: '1024px',
      data: { table: data, action },
      autoFocus: false,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (action === 'add') {
          this.dataSource.data = [result, ...this.dataSource.data];
        } else {
          this.updateRecord(result);
        }
        this.refreshTable();
        this.showNotification(
          action === 'add' ? 'snackbar-success' : 'black',
          `${action === 'add' ? 'Salvo' : 'Alterado'} com sucesso!`,
        );
      }
    });
  }



  openLessonBatchDialog(lessonId: number) {
    const eventData = new Calendar({
      // title: lessonBatch?.title,
      groupId: 'LESSON',
      // lesson: lessonBatch || null
    } as Calendar);
    const dialogRef = this.dialog.open(EventDialogComponent, {
      data: {
        lessonId: lessonId,
        calendar: eventData,
        action: 'edit',
        categories: [],
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

  private updateRecord(updatedRecord: LessonBatch) {
    const index = this.dataSource.data.findIndex(
      (record) => record.id === updatedRecord.id
    );
    if (index !== -1) {
      this.dataSource.data[index] = updatedRecord;
      this.dataSource._updateChangeSubscription();
    }
  }

  deleteItem(row: LessonBatch) {
    const dialogRef = this.dialog.open(LessonsDialogComponent, { data: row, disableClose: true });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.dataSource.data = this.dataSource.data.filter(
          (record) => record.id !== row.id
        );
        this.refreshTable();
        this.showNotification(
          'snackbar-danger',
          'Excluído com sucesso',
        );
      }
    });
  }

  private refreshTable() {
    this.paginator.pageIndex = 0;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.cdr.detectChanges();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.dataSource.filter = filterValue;
  }

  isAllSelected() {
    return this.selection.selected.length === this.dataSource.data.length;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  removeSelectedRows() {
    const totalSelect = this.selection.selected.length;
    this.dataSource.data = this.dataSource.data.filter(
      (item) => !this.selection.selected.includes(item)
    );
    this.selection.clear();
    this.showNotification(
      'snackbar-danger',
      `${totalSelect}Registros excluídos com sucesso!`,
    );
  }

  loadData() {
    this.isLoading = true; // Start loading

    this.lessonService.getAll().subscribe({
      next: (data: LessonBatch[]) => {
        this.dataSource.data = data; // Assign the data to your data source
        this.refreshTable();
        this.dataSource.filterPredicate = (
          data: LessonBatch,
          filter: string
        ) => {
          return Util.toCompare([
            data.curricularComponent?.code || '',
            data.curricularComponent?.name || '',
            data.schoolClass?.code || '',
            data.teacher?.fullName || '',
            data.school?.acronym || '',
            data.school?.name || ''
          ].join(' ')).includes(Util.toCompare(filter));
        }
        this.isLoading = false; // Stop loading
      },
      error: (err: any) => {
        console.error(err);
        this.isLoading = false; // Stop loading on error
      },
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

  exportExcel() {
    const [curricularComponent, classe, dayShift, teacher, school] = this.columnsLabels;
    const exportData = this.dataSource.filteredData.map((x) => ({
      [curricularComponent]: x.curricularComponent?.name,
      [classe]: x.schoolClass?.code,
      [dayShift]: x.schoolClass?.dayShiftId,
      [teacher]: x.teacher?.fullName || '',
      [school]: (x.school?.acronym || '')+' '+(x.school?.name || '')
    }));

    // TableExportUtil.exportToExcel(exportData as any, 'excel');
  }

  onContextMenu(event: MouseEvent, item: LessonBatch) {
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
}
