import { Component, inject, OnDestroy, ViewEncapsulation } from '@angular/core';
import {
  FormBuilder,
  Validators,
  AbstractControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { UserFormDialogComponent } from '@modules/users/form-dialog/user-form-dialog.component';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '@services';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    TranslateModule,
    MatCheckboxModule,
    MatButtonModule,
    RouterLink,
  ],
})
export class RegisterComponent implements OnDestroy {

  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private dialog = inject(MatDialog);

  private sub = new Subject<void>();
  hide = true;
  chide = true;
  registerForm = this.fb.nonNullable.group(
    {
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
    },
    {
      validators: [this.matchValidator('password', 'confirmPassword')],
    }
  );

  register() {
    console.log(this.registerForm.value);
    if(this.registerForm.valid) {
      this.openUserForm();
    }
  }

  openUserForm() {
    const { username: email, password } = this.registerForm.value;
    const submit$ = new Subject();
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '60vw',
      maxWidth: '100vw',
      data: { user: { email, password }, action: 'add', submit$ },
      autoFocus: false,
      disableClose: true
    });

    submit$
      .pipe(takeUntil(this.sub))
      .subscribe((data: any) => {
        if (data) {
          Object.assign(data, { password });
          this.auth.register(data).then(() => {
            dialogRef.close();
          });
        }
      })

    // dialogRef.afterClosed().subscribe((formValue) => {
    //   if (formValue) {
    //     Object.assign(formValue, { password });
    //     // this.auth.register(formValue).then();
    //   }
    // });
  }

  matchValidator(source: string, target: string) {
    return (control: AbstractControl) => {
      const sourceControl = control.get(source)!;
      const targetControl = control.get(target)!;
      if (targetControl.errors && !targetControl.errors) {
        return null;
      }
      if (sourceControl.value !== targetControl.value) {
        targetControl.setErrors({ mismatch: true });
        return { mismatch: true };
      } else {
        targetControl.setErrors(null);
        return null;
      }
    };
  }

  ngOnDestroy() {
    this.sub.next();
    this.sub.complete();
  }

}
