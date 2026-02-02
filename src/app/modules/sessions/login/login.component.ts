import { Component, inject, ViewEncapsulation } from '@angular/core';
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
import { JsonPipe, NgOptimizedImage } from '@angular/common';
import { Button } from '@ui/button/button';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
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
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private settings = inject(SettingsService);

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
    await this.auth.login(
      this.username.value,
      this.password.value,
      this.rememberMe.value
    );
    setTimeout(() => (this.isSubmitting = false), 3000)
  }

  admin() {
    this.form.patchValue({
      username: 'admin@mail.com',
      password: 'admin.admin',
      rememberMe: false
    });
    this.login();
  }

  principal() {
    this.form.patchValue({
      username: 'diretor@mail.com',
      password: 'admin.admin',
      rememberMe: false
    });
    this.login().then();
  }

  teacher() {
    this.form.patchValue({
      username: 'prof@mail.com',
      password: 'admin.admin',
      rememberMe: false
    });
    this.login();
  }

}
