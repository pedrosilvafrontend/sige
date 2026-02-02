import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { User } from '@core/models/interface';
import { Observable, of, throwError } from 'rxjs';
import { LocalStorageService } from '@services';
import { JWT } from '@services/JWT';

import { STATUS } from '@core/interceptor';
const jwt = new JWT();

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private http = inject(HttpClient);
  private store = inject(LocalStorageService);

  login(email: string, password: string) {
    return this.http.post('/api/auth/login', { email, password });
  }

  register(data: { email: string, password: string }) {
    return this.http.post('/api/auth/register', data);
  }

  refresh() {
    const user = Object.assign({}, this.store.get('currentUser'));

    const result = user
      ? { status: STATUS.OK, body: jwt.generate(user) }
      : { status: STATUS.UNAUTHORIZED, body: {} };

    return of(result);
  }

  logout() {
    this.store.clear();
    return of({ success: false });
  }

  user() {
    return this.http.get<User>('/user');
  }
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('An error occurred:', error);
    return throwError('Something went wrong; please try again later.');
  }
}
