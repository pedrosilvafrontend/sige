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
import { LessonsService } from '@services';
import { LessonBatch } from '@models';

export interface ClassDialogData {
  id: number;
  name: string;
  email: string;
  phone: string;
}

@Component({
  selector: 'app-delete',
  templateUrl: './lessons-delete.component.html',
  styleUrls: ['./lessons-delete.component.scss'],
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
export class LessonsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<LessonsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LessonBatch,
    public service: LessonsService
  ) {}
  confirmDelete(): void {
    this.data.curricularComponent?.name
    if(!this.data.id) return;
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
