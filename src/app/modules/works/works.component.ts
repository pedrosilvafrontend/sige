import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject, take } from 'rxjs';
import { WorksDeleteDialogComponent } from './dialogs/delete/works-delete-dialog.component';
import { MAT_DATE_LOCALE, MatOptionModule, MatRippleModule, } from '@angular/material/core';
import { CommonModule, NgClass } from '@angular/common';
import { rowsAnimation } from '@util';
import { WorkService } from '@core/services/work.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { User, Work } from '@models';
import { PageHeaderComponent } from '@ui/page-header/page-header.component';
import { AuthService } from '@services';
import { WorkFormModal } from '@modules/works/modals/work-form-modal/work-form-modal';
import { ModalDialogComponent, ModalOutput } from '@ui/modal/modal.component';

@Component({
  selector: 'app-works',
  templateUrl: './works.component.html',
  styleUrls: ['./works.component.scss'],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }],
  standalone: true,
  animations: [rowsAnimation],
  changeDetection: ChangeDetectionStrategy.Eager,
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
    TranslatePipe,
    WorkFormModal,
  ],
})
export class WorksComponent implements OnInit, OnDestroy {

  private dialog = inject(MatDialog);
  private service = inject(WorkService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  public translate = inject(TranslateService);
  public workStatusClass: any = Work.statusClass;
  public auth: User = this.authService.user$.value;
  workModal!: ModalOutput;

  columnsLabels = ['date', 'curricularComponent', 'class', 'teacher', 'title', 'score', 'status', 'actions'].map((key: string) => this.translate.instant(key));

  columnDefinitions = (() => {
    const [date, curricularComponent, classe, teacher, title, score, status, actions] = this.columnsLabels;
    return [
      { def: 'date', label: date, type: 'date', visible: true },
      { def: 'curricularComponent', label: curricularComponent, type: 'curricularComponent', visible: true },
      { def: 'schoolClass', label: classe, type: 'schoolClass', visible: true },
      { def: 'teacher', label: teacher, type: 'teacher', visible: true },
      { def: 'score', label: score, type: 'text', visible: true },
      { def: 'status', label: status, type: 'status', visible: true },
      { def: 'actions', label: actions, type: 'actionBtn', visible: true },
    ]
  })();

  dataSource = new MatTableDataSource<Work>([]);
  selection = new SelectionModel<Work>(true, []);
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

  private updateRecord(updatedRecord: Work) {
    const index = this.dataSource.data.findIndex(
      (record) => record.id === updatedRecord.id
    );
    if (index !== -1) {
      this.dataSource.data[index] = updatedRecord;
      this.dataSource._updateChangeSubscription();
    }
  }

  deleteItem(row: Work) {
    const dialogRef = this.dialog.open(
      WorksDeleteDialogComponent,
      {
        data: row,
        disableClose: true,
      }
    );
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
    this.dataSource.filter = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
  }

  isAllSelected() {
    return this.selection.selected.length === this.dataSource.data.length;
  }

  masterToggle() {
    return this.isAllSelected()
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
      `${totalSelect} Registros excluídos com sucesso!`,
    );
  }

  loadData() {
    this.isLoading = true;

    this.service.getAll().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.refreshTable();
        this.dataSource.filterPredicate = (
          data: Work,
          filter: string
        ) =>
          Object.values(data).some((value) =>
            value?.toString().toLowerCase().includes(filter)
          );
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
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

  onContextMenu(event: MouseEvent, item: Work) {
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

  protected openWorkDialog(dialogRef: MatDialogRef<ModalDialogComponent, Work> | undefined) {
    dialogRef?.afterClosed().pipe(take(1)).subscribe((result) => {
      if (result) {
        this.loadData();
      }
    })
  }

}
