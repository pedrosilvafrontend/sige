import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogClose, MatDialogActions,
} from '@angular/material/dialog';
import { Component, inject, Inject } from '@angular/core';
import { ProofService } from '@core/services/proof.service';
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
} from '@angular/forms';
import {
  MAT_DATE_LOCALE,
  MatNativeDateModule,
  MatOptionModule,
} from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { Proof } from '@models';
import { Button } from '@ui/button/button';
import { IProofForm, ProofForm } from '@form/proof.form';
import { AuthService } from '@services';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface DialogData {
  id: number;
  action: string;
  proof: Proof;
}

@Component({
  selector: 'app-proofs-form-dialog',
  templateUrl: './proofs-form-dialog.component.html',
  // styleUrls: ['./proofs-form-dialog.component.scss'],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }],
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDialogContent,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatOptionModule,
    MatDialogClose,
    MatNativeDateModule,
    TranslateModule,
    MatDialogActions,
    Button,
  ],
})
export class ProofsFormDialogComponent {
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  auth = this.authService.user$.value;
  action: string;
  dialogTitle: string;
  form: FormGroup<IProofForm>;
  proof: Proof;

  constructor(
    public dialogRef: MatDialogRef<ProofsFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public service: ProofService,
  ) {
    this.action = data.action;
    if (this.action === 'edit') {
      this.dialogTitle = 'Proof';
      this.proof = data.proof;
    } else {
      this.dialogTitle = 'New record';
      this.proof = new Proof();
    }
    this.form = ProofForm.form(this.proof);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  submit() {
    if (this.form.valid) {
      const formData: any = this.form.getRawValue();

      if (this.action === 'edit') {
        this.service.update(formData).subscribe({
          next: (response) => {
            this.dialogRef.close(response);
          },
          error: (error) => {
            console.error('Update Error:', error);
          },
        });
      } else {
        this.service.add(formData).subscribe({
          next: (response: any) => {
            this.dialogRef.close(response);
          },
          error: (error: any) => {
            console.error('Add Error:', error);
          },
        });
      }
    }
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

  protected onApprove() {
    this.service.approve(this.proof).subscribe((proof: Proof) => {
      this.showNotification('snackbar-success', 'Aprovado com sucesso!');
      this.dialogRef.close(proof);
    });
  }

  protected onReject() {
    this.service.reject(this.proof).subscribe((proof: Proof) => {
      this.showNotification('snackbar-success', 'Reprovado com sucesso!');
      this.dialogRef.close(proof);
    });
  }
}
