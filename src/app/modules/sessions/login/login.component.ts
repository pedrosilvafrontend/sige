import { Component, inject, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService, SettingsService } from '@services';
import { TranslateModule } from '@ngx-translate/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Field } from '@ui/field/field';
import { NgOptimizedImage } from '@angular/common';
import { Button } from '@ui/button/button';
import { LoadingService } from '@services/loading.service';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatCardModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCheckboxModule,
    TranslateModule,
    Field,
    Button,
    NgOptimizedImage
  ],
})
export class LoginComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private settings = inject(SettingsService);
  private loadingService = inject(LoadingService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  loading = this.loadingService.isShow;

  isSubmitting = false;
  error = '';
  hide = true;
  options = this.settings.getOptions();
  themeStyle = '';

  form = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
    rememberMe: [false],
  });

  constructor() {
    this.themeStyle = this.options.theme;
  }

  get username() {
    return this.form.get('username')!;
  }

  get password() {
    return this.form.get('password')!;
  }

  get rememberMe() {
    return this.form.get('rememberMe')!;
  }

  async login() {
    this.isSubmitting = true;
    await this.authService.login(
      this.username.value,
      this.password.value,
      this.rememberMe.value
    );
    setTimeout(() => (this.isSubmitting = false), 3000)
  }

  ngOnInit() {
    // this.authService.user$.pipe(takeUntil(this.destroy$)).subscribe({
    //   next: (user) => {
    //     if (user) {
    //       this.router.navigate(['/dashboard']).then();
    //     }
    //   }
    // })
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
