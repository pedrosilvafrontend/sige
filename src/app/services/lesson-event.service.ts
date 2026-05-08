import { Injectable } from '@angular/core';
import { LessonEvent } from '@models';
import { Observable, take } from 'rxjs';
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
      .get<LessonEvent[]>(this.API_URL, { params: params || {} })
      .pipe(take(1), catchError(this.handleError));
  }

  getPublicAll(params?: any): Observable<LessonEvent[]> {
    const classHash = params?.classHash
    if (!classHash) {
      return throwError(() => new Error('Class hash is required for public lesson events'));
    }
    delete params.classHash;
    return this.http
      .get<LessonEvent[]>(`${environment.baseUrl}/public/${classHash}/lesson-events`, { params: params || {} })
      .pipe(take(1), catchError(this.handleError));
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
