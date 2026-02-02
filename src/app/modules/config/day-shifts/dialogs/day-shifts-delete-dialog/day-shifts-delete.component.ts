import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { DayShiftsService } from '../../day-shifts.service';

export interface ClassDialogData {
  id: number;
  name: string;
  email: string;
  phone: string;
}

@Component({
  selector: 'app-delete',
  templateUrl: './day-shifts-delete.component.html',
  styleUrls: ['./day-shifts-delete.component.scss'],
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
export class SubjectDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SubjectDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ClassDialogData,
    public service: DayShiftsService
  ) {}
  confirmDelete(): void {
    this.service.deleteItem(this.data.id).subscribe({
      next: (response) => {
        // console.log('Delete Response:', response);
        this.dialogRef.close(response); // Close with the response data
        // Handle successful deletion, e.g., refresh the table or show a notification
      },
      error: (error) => {
        console.error('Delete Error:', error);
        // Handle the error appropriately
      },
    });
  }
}
