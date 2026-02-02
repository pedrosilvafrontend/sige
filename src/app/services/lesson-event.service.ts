import { Injectable } from '@angular/core';
import { LessonEvent } from '@models';
import { Observable } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class LessonEventService {
  private readonly API_URL = `${environment.baseUrl}/lesson-events`;

  constructor(private http: HttpClient) { }

  getAll(params?: any): Observable<LessonEvent[]> {
    return this.http
      .get<LessonEvent[]>(this.API_URL, { params })
      .pipe(catchError(this.handleError));
  }

  handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.log(errorMessage);
    return throwError(errorMessage);
  }
}
