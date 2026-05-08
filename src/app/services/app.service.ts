import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  protected http: HttpClient = inject(HttpClient);

  healthCheck() {
    return this.http.get('/api/health').pipe(take(1));
  }
}
