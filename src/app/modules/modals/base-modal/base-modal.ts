import {
  Component,
  effect,
  inject,
  input,
  output,
  ChangeDetectionStrategy,
  OnDestroy,
  Signal,
  model, signal
} from '@angular/core';
import { AuthService } from '@services';
import { ModalComponent, ModalDialogComponent, ModalOutput } from '@ui/modal/modal.component';
import { MatDialogRef } from '@angular/material/dialog';
import { Subject, take } from 'rxjs';
import { UntypedFormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-base-modal',
  imports: [],
  template: ``,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: ``,
})
export class BaseModal<T, R=T> implements OnDestroy {
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  auth = this.authService.user$.value;
  destroy$: Subject<void> = new Subject();
  modal: Signal<ModalComponent<T> | undefined> = signal(undefined);

  // private _modal!: ModalComponent | undefined;
  // get modal(): ModalComponent | undefined {
  //   return this._modal;
  // }
  // set modal(modal: ModalComponent | undefined) {
  //   this._modal = modal;
  //   if (modal) {
  //     this.modal$.emit(modal);
  //   }
  // }

  private _ref: MatDialogRef<ModalDialogComponent, R> | undefined;
  get ref(): MatDialogRef<ModalDialogComponent, R> | undefined {
    return this._ref;
  }
  set ref(ref: MatDialogRef<ModalDialogComponent, R> | undefined) {
    this._ref = ref;
    if (ref) {
      this.ref$.emit(ref);
    }
  }

  modal$ = output<ModalOutput<T>>({ alias: 'modal' });
  ref$ = output<MatDialogRef<ModalDialogComponent, R>>({ alias: 'ref' });
  // data!: T;
  data = model<T>();
  form = new UntypedFormGroup({});
  disabled = input(false);
  disabledButton = input(false);

  constructor() {
    this.open = this.open.bind(this);
    // this.modal$.emit(this.modal);

    effect(() => {
      const modal = this.modal();
      if (modal) {
        this.modal$.emit(modal);
      }
    });
  }

  open(data?: T | null, context?: any) {
    if (data) {
      this.data.set(data);
    }
    this.ref = this.modal()?.open(context);
    this.ref?.afterClosed().pipe(take(1)).subscribe((response) => {
      if (response) {
        this.form.reset(response);
      }
    });
    return this.ref;
  }

  close(result?: R) {
    this.modal()?.close(result);
  }

  alert(
    msg: string,
  ) {
    this.snackBar.open(msg, '', {
      duration: 3000,
      panelClass: 'snackbar',
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
