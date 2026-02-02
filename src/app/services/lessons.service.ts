import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { LessonBatch } from '@models';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class LessonsService {
  private readonly API_URL = `${environment.baseUrl}/lessons`;

  constructor(private httpClient: HttpClient) {}

  getAll(): Observable<LessonBatch[]> {
    return this.httpClient
      .get<LessonBatch[]>(this.API_URL)
      .pipe(catchError(this.handleError));
  }

  getById(id: number): Observable<LessonBatch> {
    return this.httpClient
      .get<LessonBatch>(`${this.API_URL}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /** POST: Add a new advance table */
  addItem(schoolClass: LessonBatch): Observable<LessonBatch> {
    return this.httpClient.post<LessonBatch>(this.API_URL, schoolClass).pipe(
      map((response) => {
        return Object.assign(schoolClass, response);
      }),
      catchError(this.handleError)
    );
  }

  /** PUT: Update an existing advance table */
  updateItem(schoolClass: LessonBatch): Observable<LessonBatch> {
    return this.httpClient
      .put<LessonBatch>(`${this.API_URL}/${schoolClass.id}`, schoolClass)
      .pipe(
        map((response) => {
          return Object.assign(schoolClass, response);
        }),
        catchError(this.handleError)
      );
  }

  /** DELETE: Remove an advance table by ID */
  deleteItem(id: number): Observable<number> {
    return this.httpClient.delete<void>(`${this.API_URL}/${id}`).pipe(
      map((response) => {
        return id; // return response from API
      }),
      catchError(this.handleError)
    );
  }

  getFrequencies(): Observable<string[]> {
    return this.httpClient.get<string[]>(`${environment.baseUrl}/events/frequencies`)
      .pipe(catchError(this.handleError));
  }

  /** Handle Http operation that failed. */
  private handleError(error: HttpErrorResponse) {
    // Customize this method based on your needs
    console.error('An error occurred:', error.message);
    return throwError(
      () => new Error('Something went wrong; please try again later.')
    );
  }
}
