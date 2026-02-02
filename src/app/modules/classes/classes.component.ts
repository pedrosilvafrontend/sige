import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MAT_DATE_LOCALE, MatOptionModule, MatRippleModule } from '@angular/material/core';
import { rowsAnimation } from '@util';
import { CommonModule, NgClass } from '@angular/common';
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
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ClassFormDialogComponent } from './dialogs/class-form-dialog/class-form-dialog.component';
import { ClassesService } from '@services';
import { SchoolClass } from '@models';
import { ClassDeleteDialogComponent } from './dialogs/class-delete-dialog/class-delete.component';
import { PageHeaderComponent } from '@ui/page-header/page-header.component';
import { Util } from '@util/util';

@Component({
  selector: 'app-classes',
  standalone: true,
  templateUrl: './classes.component.html',
  styleUrl: './classes.component.scss',
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
  animations: [rowsAnimation],
  imports: [
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
    TranslatePipe,
    PageHeaderComponent,
  ],
})
export class ClassesComponent implements OnInit, OnDestroy {
  private dialog = inject(MatDialog);
  private classService = inject(ClassesService);
  private snackBar = inject(MatSnackBar);
  public translate = inject(TranslateService);

  columnsLabels = ['code', 'school', 'actions'].map((key: string) => this.translate.instant(key));

  columnDefinitions = (() => {
    const [code, school, actions] = this.columnsLabels;
    return [
      // { def: 'select', label: 'Checkbox', type: 'check', visible: true },
      { def: 'code', label: code, type: 'text', visible: true },
      { def: 'school', label: school, type: 'text', visible: true },
      { def: 'actions', label: actions, type: 'actionBtn', visible: true },
    ]
  })();

  dataSource = new MatTableDataSource<SchoolClass>([]);
  selection = new SelectionModel<SchoolClass>(true, []);
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

  editCall(row: SchoolClass) {
    this.openDialog('edit', row);
  }

  openDialog(action: 'add' | 'edit', data?: SchoolClass) {
    const dialogRef = this.dialog.open(ClassFormDialogComponent, {
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

  private updateRecord(updatedRecord: SchoolClass) {
    const index = this.dataSource.data.findIndex(
      (record) => record.id === updatedRecord.id
    );
    if (index !== -1) {
      this.dataSource.data[index] = updatedRecord;
      this.dataSource._updateChangeSubscription();
    }
  }

  deleteItem(row: SchoolClass) {
    const dialogRef = this.dialog.open(ClassDeleteDialogComponent, { data: row, disableClose: true });
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

    this.classService.getAll().subscribe({
      next: (res) => {
        this.dataSource.data = res?.data; // Assign the data to your data source
        this.refreshTable();
        this.dataSource.filterPredicate = (
          data: SchoolClass,
          filter: string
        ) => {
          return Util.toCompare([
            data.code,
            data.school?.acronym || '',
            data.school?.name || ''
          ].join(' ')).includes(Util.toCompare(filter))
        }
        this.isLoading = false; // Stop loading
      },
      error: (err) => {
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
    const [name, dayShift] = this.columnsLabels;
    const exportData = this.dataSource.filteredData.map((x) => ({
      [name]: `${x.code}`,
      [dayShift]: x.dayShiftId,
    }));

    // TableExportUtil.exportToExcel(exportData as any, 'excel');
  }

  onContextMenu(event: MouseEvent, item: SchoolClass) {
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
