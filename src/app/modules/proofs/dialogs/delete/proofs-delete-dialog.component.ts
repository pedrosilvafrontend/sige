import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { ProofService } from '@core/services/proof.service';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { Proof } from '@models';

@Component({
  selector: 'app-proofs-delete',
  templateUrl: './proofs-delete-dialog.component.html',
  // styleUrls: ['./proofs-delete-dialog.component.scss'],
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
export class ProofsDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ProofsDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Proof,
    public service: ProofService
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
