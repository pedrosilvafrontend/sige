import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { School } from '@models';
import { environment } from '@env/environment';
import { Util } from '@util/util';

@Injectable({
  providedIn: 'root'
})
export class SchoolsService {
  private readonly API_URL = `${environment.baseUrl}/schools`;

  constructor(
    private httpClient: HttpClient,
  ) {
  }

  getAll(paramsOb?: Record<string, string|number|boolean>): Observable<School[]> {
    const params = Util.jsonToUrlParams(paramsOb);
    return this.httpClient
      .get<School[]>(params ? `${this.API_URL}?${params}` : this.API_URL)
      .pipe(catchError(this.handleError));
  }

  addSchool(school: School): Observable<School> {
    return this.httpClient.post<School>(this.API_URL, school).pipe(
      map((response) => {
        return response;
      }),
      catchError(this.handleError)
    );
  }

  updateSchool(school: School): Observable<School> {
    return this.httpClient
      .put<School>(`${this.API_URL}/${school.id}`, school)
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  deleteSchool(id: number): Observable<number> {
    return this.httpClient.delete<void>(`${this.API_URL}/${id}`).pipe(
      map(() => {
        return id;
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    // Customize this method based on your needs
    console.error('An error occurred:', error.message);
    return throwError(
      () => new Error('Something went wrong; please try again later.')
    );
  }
}
