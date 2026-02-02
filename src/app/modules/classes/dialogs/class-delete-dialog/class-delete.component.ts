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
import { ClassesService } from '@services';
import { School } from '@models';

export interface ClassDialogData {
  id: number;
  code: string;
  school: School;
}

@Component({
  selector: 'app-delete',
  templateUrl: './class-delete.component.html',
  styleUrls: ['./class-delete.component.scss'],
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
export class ClassDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ClassDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ClassDialogData,
    public service: ClassesService
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
