import { environment } from '@env/environment';
import { inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, take, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export class BaseService<T=any> {
  protected readonly baseUrl = environment.baseUrl;
  protected path = '';
  protected http: HttpClient = inject(HttpClient);
  protected urlParams: any = {};

  constructor(path: string) {
    this.path = path;
  }

  get apiURL(): string {
    let path = this.path || '';
    Object.entries(this.urlParams).forEach(([key, value]) => {
      path = path.replace(`:${key}`, value as any);
    })
    return `${this.baseUrl}/${path}`;
  }

  getById(id: any): Observable<T> {
    return this.http
      .get<T>(`${this.apiURL}/${id}`)
      .pipe(take(1), catchError(this.handleError));
  }

  getAll(params?: any): Observable<T[]> {
    return this.http
      .get<T[]>(`${this.apiURL}`, { params })
      .pipe(take(1), catchError(this.handleError));
  }

  add(item: T): Observable<T> {
    return this.http.post<T>(`${this.apiURL}`, item).pipe(
      take(1),
      map((response: any) => {
        if (item && response && response.id) {
          (item as any).id = response.id;
        }
        return response;
      }),
      catchError(this.handleError)
    );
  }

  update(item: T): Observable<T> {
    const id = item ? (item as any)?.id : item;
    return this.http
      .put<T>(`${this.apiURL}/${id}`, item)
      .pipe(
        take(1),
        map((response: any) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  deleteItem(id: number): Observable<number> {
    return this.http.delete<void>(`${this.apiURL}/${id}`).pipe(
      take(1),
      map((response: any) => {
        return response || id;
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
