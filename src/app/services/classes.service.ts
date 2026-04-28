import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SchoolClass, ApiResponse } from '@models';
import { BaseApiService } from '@services/base-api-service';

export type ClassesGetAllParams = {
  schoolId?: number;
  degreeId?: string;
  dayShiftId?: string;
};

@Injectable({
  providedIn: 'root'
})
export class ClassesService extends BaseApiService<SchoolClass> {

  constructor() {
    super('/classes')
  }

  override returnCachedData(params?: ClassesGetAllParams): boolean {
    const data = this.lastData.getValue();
    return (!!params?.schoolId && data[0]?.school?.id === params?.schoolId);
  }

  /** GET: Fetch all advance tables */
  override getAll(params?: ClassesGetAllParams, force?: boolean): Observable<ApiResponse<SchoolClass[]>> {
    if (!force && this.returnCachedData(params)) {
      return this.lastData.pipe(
        map((data) => {
          return { data };
        })
      );
    }

    let url = this.API_URL;
    const urlParams = new URLSearchParams();

    if (params?.schoolId) {
      urlParams.append("schoolId", String(params.schoolId));
    }

    if (params?.degreeId) {
      urlParams.append("degreeId", String(params.degreeId));
    }

    if (params?.dayShiftId) {
      urlParams.append("dayShiftId", String(params.dayShiftId));
    }

    url = [this.API_URL, urlParams].join('?');

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
