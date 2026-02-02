import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DayShifts } from './day-shifts.model';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class DayShiftsService {
  private readonly API_URL = `${environment.baseUrl}/day-shifts`;

  constructor(private httpClient: HttpClient) {}

  getAll(): Observable<DayShifts[]> {
    return this.httpClient
      .get<DayShifts[]>(`${this.API_URL}`)
      .pipe(catchError(this.handleError));
  }

  add(item: DayShifts): Observable<DayShifts> {
    return this.httpClient.post<DayShifts>(`${this.API_URL}`, item).pipe(
      map((response) => {
        return item; // return response from API
      }),
      catchError(this.handleError)
    );
  }

  update(item: DayShifts): Observable<DayShifts> {
    return this.httpClient
      .put<DayShifts>(`${this.API_URL}/${item.id}`, item)
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
