import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { WorkService } from '@core/services/work.service';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { Work } from '@models';

@Component({
  selector: 'app-works-delete',
  templateUrl: './works-delete-dialog.component.html',
  // styleUrls: ['./works-delete-dialog.component.scss'],
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButtonModule,
    MatDialogClose,
    TranslateModule,
  ],
})
export class WorksDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<WorksDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Work,
    public service: WorkService
  ) {}

  confirmDelete(): void {
    this.service.deleteItem(this.data.id).subscribe({
      next: (response) => {
        this.dialogRef.close(response);
      },
      error: (error) => {
        console.error('Delete Error:', error);
      },
    });
  }
}
