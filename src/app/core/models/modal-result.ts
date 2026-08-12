import { MatDialogRef } from '@angular/material/dialog';
import { ModalDialogComponent } from '@ui/modal/modal.component';

export interface ModalResult<T=any> {
  success?: boolean,
  nextMode?: boolean,
  data?: T,
  action?: string,
  refresh?: boolean
}

export interface ModalOutput<T = any> {
  open: (data?: T) => MatDialogRef<ModalDialogComponent>;
  close: () => void;
}
