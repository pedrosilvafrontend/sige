import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ClassYears } from '@models';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class ClassYearsService {
  private readonly API_URL = `${environment.baseUrl}/class-years`;

  constructor(private httpClient: HttpClient) {}

  getAll(): Observable<ClassYears[]> {
    return this.httpClient
      .get<ClassYears[]>(`${this.API_URL}`)
      .pipe(catchError(this.handleError));
  }

  add(item: ClassYears): Observable<ClassYears> {
    return this.httpClient.post<ClassYears>(`${this.API_URL}`, item).pipe(
      map((response) => {
        return item; // return response from API
      }),
      catchError(this.handleError)
    );
  }

  update(item: ClassYears): Observable<ClassYears> {
    return this.httpClient
      .put<ClassYears>(`${this.API_URL}/${item.id}`, item)
      .pipe(
        map((response) => {
          return item; // return response from API
        }),
        catchError(this.handleError)
      );
  }

  deleteItem(id: number): Observable<number> {
    return this.httpClient.delete<void>(`${this.API_URL}/${id}`).pipe(
      map((response) => {
        return id; // return response from API
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
