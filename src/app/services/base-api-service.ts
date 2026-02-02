import { environment } from '@env/environment';
import { inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiResponse } from '@models';

export class BaseApiService<T=any> {
  protected readonly baseUrl = environment.baseUrl;
  protected API_URL = '';
  protected http: HttpClient = inject(HttpClient);
  public lastData = new BehaviorSubject<T[]>([]);

  constructor(path: string) {
    this.API_URL = this.baseUrl + path;
  }

  returnCachedData(params?: any): boolean {
    // override this method in child classes to return cached data if available
    return false;
  }

  getAll(): Observable<ApiResponse<T[]>> {
    if (this.returnCachedData()) {
      return this.lastData.pipe(
        map((data) => {
          return { data };
        })
      );
    }
    return this.http
      .get<ApiResponse<T[]>>(`${this.API_URL}`)
      .pipe(
        map((response) => {
          this.lastData.next(response.data);
          return response;
        }),
        catchError(this.handleError)
      );
  }

  add(item: T): Observable<T> {
    return this.http.post<T>(`${this.API_URL}`, item).pipe(
      map((response) => {
        this.lastData.next([]);
        return item; // return response from API
      }),
      catchError(this.handleError)
    );
  }

  update(item: T): Observable<T> {
    const id = item ? (item as any)?.id : item;
    return this.http
      .put<T>(`${this.API_URL}/${id}`, item)
      .pipe(
        map((response) => {
          this.lastData.next([]);
          return item; // return response from API
        }),
        catchError(this.handleError)
      );
  }

  deleteItem(id: number): Observable<number> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      map((response) => {
        this.lastData.next([]);
        return id; // return response from API
      }),
      catchError(this.handleError)
    );
  }

  /** Handle Http operation that failed. */
  protected handleError(error: HttpErrorResponse) {
    // Customize this method based on your needs
    console.error('An error occurred:', error.message);
    return throwError(
      () => new Error('Something went wrong; please try again later.')
    );
  }

}
