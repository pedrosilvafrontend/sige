import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SchoolClass, ApiResponse } from '@models';
import { BaseApiService } from '@services/base-api-service';

@Injectable({
  providedIn: 'root'
})
export class ClassesService extends BaseApiService<SchoolClass> {

  constructor() {
    super('/classes')
  }

  override returnCachedData(params: any): boolean {
    const data = this.lastData.getValue();
    return (params?.schoolId && data[0]?.school?.id === params?.schoolId);
  }

  /** GET: Fetch all advance tables */
  override getAll(schoolId?: number | null): Observable<ApiResponse<SchoolClass[]>> {
    if (this.returnCachedData({schoolId})) {
      return this.lastData.pipe(
        map((data) => {
          return { data };
        })
      );
    }

    let url = this.API_URL;

    if (schoolId) {
      const params = new URLSearchParams();
      params.append("school_id", String(schoolId));
      url = [this.API_URL, params].join('?');
    }

    return this.http
      .get<ApiResponse<SchoolClass[]>>(url)
      .pipe(
        map((response) => {
          this.lastData.next(response.data);
          return response;
        }),
        catchError(this.handleError)
      );
  }

  /** POST: Add a new advance table */
  addItem(schoolClass: SchoolClass): Observable<SchoolClass> {
    return this.http.post<SchoolClass>(this.API_URL, schoolClass).pipe(
      map((response) => {
        this.lastData.next([]);
        return response; // return response from API
      }),
      catchError(this.handleError)
    );
  }

  /** PUT: Update an existing advance table */
  updateItem(schoolClass: SchoolClass): Observable<SchoolClass> {
    return this.http
      .put<SchoolClass>(`${this.API_URL}/${schoolClass.id}`, schoolClass)
      .pipe(
        map((response) => {
          this.lastData.next([]);
          return response; // return response from API
        }),
        catchError(this.handleError)
      );
  }

  /** DELETE: Remove an advance table by ID */
  override deleteItem(id: number): Observable<number> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      map(() => {
        this.lastData.next([]);
        return id; // return response from API
      }),
      catchError(this.handleError)
    );
  }

}
