import { effect, inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, merge, of, firstValueFrom } from 'rxjs';
import { catchError, share, switchMap } from 'rxjs/operators';
import { TokenService } from './token.service';
import { LoginService } from './login.service';
import { Router } from '@angular/router';
import { LocalStorageService } from '@services';
import { Token, User } from '@models/interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { School } from '@models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$ = new BehaviorSubject<User>({});
  private router = inject(Router);
  private store = inject(LocalStorageService);
  private loginService = inject(LoginService);
  private tokenService = inject(TokenService);
  private snackBar = inject(MatSnackBar);
  userStoreKey = 'currentUser';
  schoolStoreKey = 'school';
  school = signal(new School());

  private change$ = merge(
    this.tokenService.change(),
    this.tokenService.refresh().pipe(switchMap(() => this.refresh()))
  ).pipe(
    switchMap(() => {
      return this.assignUser(this.user$);
    }),
    share()
  );

  constructor() {
    if (!this.tokenService.getBearerToken()) {
      this.store.remove(this.userStoreKey);
    }
    this.user$.next(this.store.get(this.userStoreKey));
    this.checkSelectedSchool();

    effect(() => {
      if (this.school() && this.school().id !== this.store.get(this.schoolStoreKey)?.id) {
        this.store.set(this.schoolStoreKey, this.school());
      }
    });
  }

  checkSelectedSchool() {
    const schools = this.user$.getValue().schools || [];
    const schoolStore: School | undefined = this.store.get(this.schoolStoreKey);
    const has = schools.some(s => s.id === schoolStore?.id);
    const school = has ? schoolStore : schools[0];
    if (!school) return;
    this.school.set(school);
    this.store.set(this.schoolStoreKey, school);
  }

  init() {
    return new Promise<void>((resolve) =>
      this.change$.subscribe(() => resolve())
    );
  }

  change() {
    return this.change$;
  }

  check() {
    return this.tokenService.valid();
  }

  checkSession() {
    const userStore = this.store.get(this.userStoreKey);
    if (!userStore?.id) {
      this.logout();
      return;
    }
    this.user$.next(userStore);
  }

  async register(data: { email: string, password: string }) {
    let response = null;
    try {
      response = await firstValueFrom(this.loginService.register(data));
    }
    catch (error) {
      console.log(error);
    }
    return response;
  }

  async login(username: string, password: string, rememberMe = false) {
    this.store.clear();
    try {
      const response = await firstValueFrom(this.loginService.login(username, password).pipe(catchError((error) => {
        console.log(error);
        // return of({ status: 401, body: { err: error.error } });
        throw error;
      })));

      const returnValue = JSON.parse(JSON.stringify(response))['token'];
      this.tokenService.set({ access_token: returnValue, token_type: 'Bearer' });

      // Get user from response
      const user = JSON.parse(JSON.stringify(response))['user'];

      // Update user with roles and permissions from token
      user.roles = this.tokenService.roleArray;
      user.permissions = this.tokenService.permissionArray;

      this.user$.next(user);
      this.store.set(this.userStoreKey, user);

      this.router.navigate(['dashboard']);
    }
    catch (error) {
      this.snackBar.open('Usuário ou senha inválidos', 'x', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      })
    }
    // return this.loginService.login(username, password, rememberMe).subscribe({
    //   next: (response) => {
    //     const returnValue = JSON.parse(JSON.stringify(response))['token'];
    //     this.tokenService.set(returnValue);
    //
    //     // Get user from response
    //     const user = JSON.parse(JSON.stringify(response))['user'];
    //
    //     // Update user with roles and permissions from token
    //     user.roles = this.tokenService.roleArray;
    //     user.permissions = this.tokenService.permissionArray;
    //
    //     // Update user subject and store in local storage
    //     this.user$.next(user);
    //     this.store.set(this.userStoreKey, user);
    //
    //     this.router.navigate(['dashboard/dashboard1']);
    //   },
    //   error: (error) => {
    //     // Handle errors here
    //     console.error(error);
    //   },
    // });
  }
  refresh() {
    return this.loginService.refresh().pipe(
      switchMap((response) => {
        if (response.status === 200 && response.body) {
          // Set the new token
          this.tokenService.set(response.body as Token);

          // Update user with roles and permissions from the refreshed token
          const currentUser = this.user$.getValue();
          currentUser.roles = this.tokenService.roleArray;
          currentUser.permissions = this.tokenService.permissionArray;

          // Update the user$ BehaviorSubject and local storage
          this.user$.next(currentUser);
          this.store.set(this.userStoreKey, currentUser);
        }

        return of(response);
      })
    );
  }

  logout() {
    return this.loginService.logout().subscribe((res) => {
      if (!res.success) {
        this.tokenService.clear();
        this.store.clear();
        this.router.navigateByUrl('/login').then();
      }
    });
  }

  user() {
    return this.user$.pipe(share());
  }

  // menu() {
  //   return iif(() => this.check(), this.loginService.menu(), of([]));
  // }

  assignUser(user: BehaviorSubject<User>): Observable<User> {
    // Get the current user value
    const currentUser = user.getValue();

    // Update user with roles and permissions from token if available
    if (this.tokenService.valid()) {
      currentUser.roles = this.tokenService.roleArray;
      currentUser.permissions = this.tokenService.permissionArray;
      this.user$.next(currentUser);
    }
    else {
      this.user$.next({});
      this.user$.complete();
    }

    // Return an observable that emits the new user value
    return this.user$.asObservable();
  }
}
