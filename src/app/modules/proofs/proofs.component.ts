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
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject } from 'rxjs';
import { ProofsFormDialogComponent } from './dialogs/form-dialog/proofs-form-dialog.component';
import { ProofsDeleteDialogComponent } from './dialogs/delete/proofs-delete-dialog.component';
import {
  MAT_DATE_LOCALE,
  MatOptionModule,
  MatRippleModule,
} from '@angular/material/core';
import { CommonModule, NgClass } from '@angular/common';
import { rowsAnimation } from '@util';
import { ProofService } from '@core/services/proof.service';
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
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Proof, User } from '@models';
import { PageHeaderComponent } from '@ui/page-header/page-header.component';
import { AuthService } from '@services';

@Component({
  selector: 'app-proofs',
  templateUrl: './proofs.component.html',
  styleUrls: ['./proofs.component.scss'],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }],
  standalone: true,
  animations: [rowsAnimation],
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
  ],
})
export class ProofsComponent implements OnInit, OnDestroy {

  private dialog = inject(MatDialog);
  private service = inject(ProofService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  public translate = inject(TranslateService);
  public proofStatusClass: any = Proof.statusClass;
  public auth: User = this.authService.user$.value;

  columnsLabels = ['date', 'curricularComponent', 'class', 'teacher', 'title', 'score', 'status', 'actions'].map((key: string) => this.translate.instant(key));

  columnDefinitions = (() => {
    const [date, curricularComponent, classe, teacher, title, score, status, actions] = this.columnsLabels;
    return [
      { def: 'date', label: date, type: 'date', visible: true },
      { def: 'curricularComponent', label: curricularComponent, type: 'curricularComponent', visible: true },
      { def: 'schoolClass', label: classe, type: 'schoolClass', visible: true },
      { def: 'teacher', label: teacher, type: 'teacher', visible: true },
      { def: 'title', label: title, type: 'text', visible: true },
      { def: 'score', label: score, type: 'text', visible: true },
      { def: 'status', label: status, type: 'status', visible: true },
      { def: 'actions', label: actions, type: 'actionBtn', visible: true },
    ]
  })();

  dataSource = new MatTableDataSource<Proof>([]);
  selection = new SelectionModel<Proof>(true, []);
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

  editCall(row: Proof) {
    this.openDialog('edit', row);
  }

  approveItem(row: Proof) {
    this.service.approve(row).subscribe(() => {
      this.refresh();
      this.showNotification('snackbar-success', 'Aprovado com sucesso!');
    });
  }

  openDialog(action: 'add' | 'edit', data?: Proof) {
    const dialogRef = this.dialog.open(ProofsFormDialogComponent, {
      width: '60vw',
      maxWidth: '100vw',
      data: { proof: data, action },
      autoFocus: false,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // if (action === 'add') {
        //   this.dataSource.data = [result, ...this.dataSource.data];
        // } else {
        //   this.updateRecord(result);
        // }
        // this.refreshTable();
        this.loadData();
        this.showNotification(
          action === 'add' ? 'snackbar-success' : 'black',
          `${action === 'add' ? 'Salvo' : 'Alterado'} com sucesso!`,
        );
      }
    });
  }

  private updateRecord(updatedRecord: Proof) {
    const index = this.dataSource.data.findIndex(
      (record) => record.id === updatedRecord.id
    );
    if (index !== -1) {
      this.dataSource.data[index] = updatedRecord;
      this.dataSource._updateChangeSubscription();
    }
  }

  deleteItem(row: Proof) {
    const dialogRef = this.dialog.open(
      ProofsDeleteDialogComponent,
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
          data: Proof,
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

  onContextMenu(event: MouseEvent, item: Proof) {
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
