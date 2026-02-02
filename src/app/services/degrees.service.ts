import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Degree } from '@models';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DegreesService {
  private readonly API_URL = `${environment.baseUrl}/degrees`;

  constructor(private httpClient: HttpClient) {}

  getAll(): Observable<Degree[]> {
    return this.httpClient
      .get<Degree[]>(`${this.API_URL}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    // Customize this method based on your needs
    console.error('An error occurred:', error.message);
    return throwError(
      () => new Error('Something went wrong; please try again later.')
    );
  }
}
