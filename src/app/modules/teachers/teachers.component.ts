import {
  Component,
  ElementRef, inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject, takeUntil } from 'rxjs';
import { TeacherFormDialogComponent } from './dialogs/form-dialog/teacher-form-dialog.component';
import { TeacherDeleteDialogComponent } from './dialogs/delete/teacher-delete-dialog.component';
import {
  MAT_DATE_LOCALE,
  MatOptionModule,
  MatRippleModule,
} from '@angular/material/core';
import { CommonModule, DatePipe, formatDate, NgClass } from '@angular/common';
// import { rowsAnimation, TableExportUtil } from '@shared';
import { UserService } from '../users/user.service';
// import { PageHeaderComponent } from '@ui/page-header/page-header.component';
// import { FeatherIconsComponent } from '@shared/components/feather-icons/feather-icons.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateService } from '@ngx-translate/core';
import { AddressPipe } from '@core/util/address.pipe';
import { User } from '@core/models/interface';
import * as fns from 'date-fns';
import { PageHeaderComponent } from '@ui/page-header/page-header.component';

@Component({
  selector: 'app-teachers',
  templateUrl: './teachers.component.html',
  styleUrls: ['./teachers.component.scss'],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }, AddressPipe],
  standalone: true,
  // animations: [rowsAnimation],
  imports: [
    // PageHeaderComponent,
    // FeatherIconsComponent,
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
    PageHeaderComponent,
  ],
})
export class TeachersComponent implements OnInit, OnDestroy {

  private dialog = inject(MatDialog);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  public translate = inject(TranslateService);
  private addressPipe = inject(AddressPipe);

  columnsLabels = ['code', 'name', 'email', 'gender', 'mobile', 'school', 'actions'].map((key: string) => this.translate.instant(key));

  columnDefinitions = (() => {
    const [code, name, email, gender, mobile, school, actions] = this.columnsLabels;
    return [
      // { def: 'select', label: 'Checkbox', type: 'check', visible: true },
      { def: 'code', label: code, type: 'text', visible: true, style: { maxWidth: '100px' } },
      { def: 'name', label: name, type: 'text', visible: true },
      { def: 'email', label: email, type: 'email', visible: true },
      { def: 'gender', label: gender, type: 'text', visible: true },
      { def: 'mobile', label: mobile, type: 'phone', visible: true },
      { def: 'schools', label: school, type: 'schools', visible: true },
      { def: 'actions', label: actions, type: 'actionBtn', visible: true },
    ]
  })();

  dataSource = new MatTableDataSource<User>([]);
  selection = new SelectionModel<User>(true, []);
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

  editCall(row: User) {
    this.openDialog('edit', row);
  }

  openDialog(action: 'add' | 'edit', data?: User) {
    const dialogRef = this.dialog.open(TeacherFormDialogComponent, {
      width: '60vw',
      maxWidth: '100vw',
      data: { userTable: data, action },
      autoFocus: false,
      disableClose: true
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

  private updateRecord(updatedRecord: User) {
    const index = this.dataSource.data.findIndex(
      (record) => record.id === updatedRecord.id
    );
    if (index !== -1) {
      this.dataSource.data[index] = updatedRecord;
      this.dataSource._updateChangeSubscription();
    }
  }

  deleteItem(row: User) {
    const dialogRef = this.dialog.open(TeacherDeleteDialogComponent, { data: row, disableClose: true });
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
      `${totalSelect}Registros excluídos com sucesso!`,
    );
  }

  loadData() {
    this.isLoading = true; // Start loading

    this.userService.getAll('teacher').subscribe({
      next: (data) => {
        this.dataSource.data = data; // Assign the data to your data source
        this.refreshTable();
        this.dataSource.filterPredicate = (
          data: User,
          filter: string
        ) =>
          Object.values(data).some((value) =>
            value.toString().toLowerCase().includes(filter)
          );
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
    const [name, email, gender, birthDate, mobile, address, country] = this.columnsLabels;
    const exportData = this.dataSource.filteredData.map((x) => ({
      [name]: x.fullName,
      [email]: x.email,
      [gender]: x.gender,
      [birthDate]: x.birthDate ? fns.format(new Date(x.birthDate), 'yyyy-MM-dd') || '' : '',
      [mobile]: x.mobile,
      [address]: this.addressPipe.transform(x['address']),
      [country]: x['country'],
    }));

    // TableExportUtil.exportToExcel(exportData, 'excel');
  }

  onContextMenu(event: MouseEvent, item: User) {
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
