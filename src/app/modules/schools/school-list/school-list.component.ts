import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { School } from '@models';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject, take } from 'rxjs';
import { SchoolsUtils } from '@modules/schools/schools.utils';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { SchoolsService } from '@services/schools.service';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { SchoolFormDialogComponent } from '@modules/schools/dialogs/school-form-dialog/school-form-dialog.component';
import { SchoolDeleteDialogComponent } from '@modules/schools/dialogs/school-delete-dialog/school-delete.component';
import { CommonModule, DatePipe, formatDate, NgClass } from '@angular/common';
import { TableExport } from '@core/util/table-export';
import { MAT_DATE_LOCALE, MatOptionModule, MatRippleModule } from '@angular/material/core';
import { AddressPipe } from '@core/util/address.pipe';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule, UntypedFormArray } from '@angular/forms';
import { AuthService, PermissionService } from '@services';
import { Permission } from '@models';
import { rowsAnimation } from '@core/util';
import { format } from 'date-fns';

@Component({
  selector: 'app-school-list',
  standalone: true,
  imports: [
    CommonModule,
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
    AddressPipe,
    TranslatePipe,
  ],
  templateUrl: './school-list.component.html',
  styleUrl: './school-list.component.scss',
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }],
  animations: [rowsAnimation],
  encapsulation: ViewEncapsulation.None
})
export class SchoolListComponent implements OnInit, OnDestroy {
  private dialog = inject(MatDialog);
  private schoolsService = inject(SchoolsService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);
  public translate = inject(TranslateService);
  public permissionService = inject(PermissionService);

  @Input() type: 'select' | 'full' = 'select';
  @Input() form!: UntypedFormArray;
  @Input() params: any = {} as any;
  columnsLabels = ['name', 'email', 'phone', 'address', 'country', 'actions'].map((key: string) => this.translate.instant(key));
  columnDefinitions: any[] = [];
  compareById = (a: School, b: School) => a.id === b.id;
  selection = new SelectionModel<School>(true, [], false, this.compareById);
  permission: Partial<Permission> = {};

  dataSource = new MatTableDataSource<School>([]);
  contextMenuPosition = { x: '0px', y: '0px' };
  isLoading = true;
  private destroy$ = new Subject<void>();
  public utils = SchoolsUtils;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('filter') filter!: ElementRef;
  @ViewChild(MatMenuTrigger) contextMenu?: MatMenuTrigger;

  constructor(
  ) {
    this.permissionService.permissions.pipe(take(1)).subscribe((per) => {
      this.permission = per.find(p => p.resource == 'schools') || {};
    })
  }

  ngOnInit() {
    this.columnDefinitions =  this.getColumnDefinitions();
    this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getColumnDefinitions(): any[] {
    const [name, email, phone, address, actions] = this.columnsLabels;
    const cols = [
      { def: 'select', label: 'Checkbox', type: 'check', visible: this.type === 'select' },
      { def: 'name', label: name, type: 'text', visible: true, width: '25%' },
      { def: 'email', label: email, type: 'email', visible: true, width: '25%' },
      { def: 'phone', label: phone, type: 'phone', visible: true, width: '15%' },
      { def: 'address', label: address, type: 'address', visible: true, width: '25%' },
    ];

    if (this.type === 'full') {
      cols.push({ def: 'actions', label: actions, type: 'actionBtn', visible: true });
    }
    return cols;
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

  editCall(row: School) {
    const action = (this.permission.create || this.permission.update) ? 'edit' : 'view';
    this.openDialog(action, row);
  }

  view(row: School) {
    this.openDialog('view', row);
  }

  openDialog(action: 'add' | 'edit' | 'view', data?: School) {
    if (this.type === 'select') {
      return;
    }
    const dialogRef = this.dialog.open(SchoolFormDialogComponent, {
      width: '99vw',
      maxWidth: '1024px',
      data: { table: data, action },
      autoFocus: false,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (action === 'add') {
          this.dataSource.data = [result, ...this.dataSource.data];
          this.dataSource._updateChangeSubscription();
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

  private updateRecord(updatedRecord: School) {
    const index = this.dataSource.data.findIndex(
      (record) => record.id === updatedRecord.id
    );
    if (index !== -1) {
      this.dataSource.data[index] = updatedRecord;
      this.dataSource._updateChangeSubscription();
    }
  }

  deleteItem(row: School) {
    if (this.type === 'select') {
      return;
    }
    const dialogRef = this.dialog.open(SchoolDeleteDialogComponent, { data: row, disableClose: true });
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

  isSelectedFn() {
    const selected = this.selection.selected.map((s) => s.id);
    return (row: School) => selected.includes(row.id);
  }

  loadData() {
    this.isLoading = true; // Start loading

    this.schoolsService.getAll(this.params).pipe(take(1)).subscribe({
      next: (data) => {
        this.dataSource.data = data; // Assign the data to your data source
        this.refreshTable();
        this.dataSource.filterPredicate = (
          data: School,
          filter: string
        ) =>
          Object.values(data).some((value: any) =>
            value.toString().toLowerCase().includes(filter)
          );
        (this.form?.value || []).forEach((item: any) => {
          this.selection.select(item)
        })
        this.isLoading = false; // Stop loading
        this.cdr.detectChanges();
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
    const [name, email, foundationDate, phone, address] = this.columnsLabels;
    const exportData = this.dataSource.filteredData.map((x) => ({
      [name]: x.name,
      [email]: x.email,
      [foundationDate]: format(new Date(x.foundationDate), 'yyyy-MM-dd') || '',
      [phone]: x.phone,
      [address]: x.address?.address || '',
    }));

    TableExport.exportToExcel(exportData, 'excel');
  }

  onContextMenu(event: MouseEvent, item: School) {
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
