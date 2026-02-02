import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '@env/environment';
import { Address } from './address';

@Injectable({
  providedIn: 'root',
})
export class TeachersService {
  private readonly API_URL = `${environment.baseUrl}/users`;

  constructor(private httpClient: HttpClient) {}

  /** GET: Fetch all items */
  getAll(role?: string): Observable<Address[]> {
    const url = role ? `${this.API_URL}/role/${role}` : this.API_URL;
    return this.httpClient
      .get<Address[]>(url);
  }

  /** POST: Add a new item */
  addItem(item: Address): Observable<Address> {
    return this.httpClient.post<Address>(this.API_URL, item).pipe(
      map((response) => {
        return item; // return response from API
      }),
      catchError(this.handleError)
    );
  }

  /** PUT: Update an existing item */
  updateItem(item: Address): Observable<Address> {
    return this.httpClient
      .put<Address>(`${this.API_URL}/${item.id}`, item)
      .pipe(
        map((response) => {
          return item; // return response from API
        }),
        catchError(this.handleError)
      );
  }

  /** DELETE: Remove item by ID */
  deleteItem(id: number): Observable<number> {
    return this.httpClient.delete<void>(`${this.API_URL}`).pipe(
      map((response) => {
        return id; // return response from API
      }),
      catchError(this.handleError)
    );
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
