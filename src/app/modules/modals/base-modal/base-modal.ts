import { Component, effect, inject, input, output, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '@services';
import { ModalComponent, ModalDialogComponent } from '@ui/modal/modal.component';
import { MatDialogRef } from '@angular/material/dialog';
import { take } from 'rxjs';
import { UntypedFormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ModalOutput, ModalResult } from '@models/modal-result';

@Component({
  selector: 'app-base-modal',
  imports: [],
  template: ``,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: ``,
})
export class BaseModal<T> {
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  auth = this.authService.user$.value;
  modal!: ModalComponent;
  modal$ = output<ModalOutput<T>>({ alias: 'modal' });
  ref!: MatDialogRef<ModalDialogComponent, ModalResult<T>>;
  ref$ = output<MatDialogRef<ModalDialogComponent, ModalResult<T>>>({ alias: 'ref' });
  data!: T;
  dataInput = input<T>();
  form = new UntypedFormGroup({});
  disabled = input(false);
  disabledButton = input(false);

  constructor() {
    this.open = this.open.bind(this);

    effect(() => {
      const data = this.dataInput();
      if (data) {
        // console.log('dataInput changed', data);
        this.data = data;
      }
    });
  }

  open(data?: T) {
    if (data) {
      this.data = data;
    }
    // this.item = {
    //   ...(this.itemInput() || {}),
    //   ...(data || {}),
    // };
    this.ref = this.modal?.open();
    this.ref?.afterClosed().pipe(take(1)).subscribe((response) => {
      if (response) {
        this.form.reset(response);
      }
    });
    this.ref$.emit(this.ref);
    return this.ref;
  }

  close(result?: T) {
    this.modal?.close(result);
  }

  alert(
    msg: string,
  ) {
    this.snackBar.open(msg, '', {
      duration: 3000,
      panelClass: 'snackbar',
    });
  }

}
