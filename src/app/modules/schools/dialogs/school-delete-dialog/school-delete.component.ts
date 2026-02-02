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
import { SchoolsService } from '@services/schools.service';

export interface SchoolDialogData {
  id: number;
  name: string;
  email: string;
  phone: string;
}

@Component({
  selector: 'app-delete',
  templateUrl: './school-delete.component.html',
  styleUrls: ['./school-delete.component.scss'],
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
export class SchoolDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SchoolDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SchoolDialogData,
    public service: SchoolsService
  ) {}
  confirmDelete(): void {
    this.service.deleteSchool(this.data.id).subscribe({
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
