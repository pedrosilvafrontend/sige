import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private snackBar = inject(MatSnackBar);

  showNotification(
    colorName: string,
    text: string,
  ) {
    this.snackBar.open(text, '', {
      duration: 3000,
      panelClass: colorName,
    });
  }

  success(message: string): void {
    return this.showNotification('snackbar-success', message);
  }

  danger(message: string): void {
    return this.showNotification('snackbar-danger', message);
  }

  black(message: string): void {
    return this.showNotification('black', message);
  }

}
