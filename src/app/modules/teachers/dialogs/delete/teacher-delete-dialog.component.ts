import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { UserService } from '../../../users/user.service';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

export interface DialogData {
  id: number;
  fullName: string;
  email: string;
  mobile: string;
}

@Component({
  selector: 'app-delete',
  templateUrl: './teacher-delete-dialog.component.html',
  styleUrls: ['./teacher-delete-dialog.component.scss'],
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
export class TeacherDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<TeacherDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public userTableService: UserService
  ) {}
  confirmDelete(): void {
    this.userTableService.deleteItem(this.data.id).subscribe({
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
