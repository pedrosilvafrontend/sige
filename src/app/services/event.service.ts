import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, of } from 'rxjs';
import { Calendar, LesEvent } from '@models';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '@env/environment';
import { RequestCache } from '@util';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private readonly API_URL = `${environment.baseUrl}/events`;
  private readonly PUBLIC_URL = `${environment.baseUrl}/public/events`;
  // private readonly API_URL = 'assets/data/calendar.json';
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };
  dataChange: BehaviorSubject<Calendar[]> = new BehaviorSubject<Calendar[]>([]);
  // Temporarily stores data from dialogs
  dialogData!: Calendar;
  cache = new RequestCache<Calendar[]>();

  constructor(private http: HttpClient) { }

  get data(): Calendar[] {
    return this.dataChange.value;
  }

  getDialogData() {
    return this.dialogData;
  }

  getAllCalendars(params?: any): Observable<Calendar[]> {
    const url = params.classHash ? `${this.PUBLIC_URL}/${params.classHash}` : this.API_URL;
    delete params.classHash;
    const cachedValue = this.cache.getCache(url, params);
    if (cachedValue) {
      return of(cachedValue);
    }
    return this.http
      .get<Calendar[]>(url, { params })
      .pipe(catchError(this.handleError));
  }

  getAll(params?: any): Observable<LesEvent[]> {
    return this.http
      .get<LesEvent[]>(this.API_URL, { params })
      .pipe(catchError(this.handleError));
  }

  /** POST: Add a new advance table */
  addItem(schoolClass: LesEvent): Observable<LesEvent> {
    return this.http.post<LesEvent>(this.API_URL, schoolClass).pipe(
      map((response) => {
        return Object.assign(schoolClass, response);
      }),
      catchError(this.handleError)
    );
  }

  /** PUT: Update an existing advance table */
  updateItem(schoolClass: LesEvent): Observable<LesEvent> {
    return this.http
      .put<LesEvent>(`${this.API_URL}/${schoolClass.id}`, schoolClass)
      .pipe(
        map((response) => {
          return Object.assign(schoolClass, response);
        }),
        catchError(this.handleError)
      );
  }

  async addUpdateCalendar(calendar: Calendar): Promise<Calendar> {
    if (!calendar.id) {
      delete calendar.id;
    }
    this.dialogData = calendar;
    const add = calendar.id
      ? this.http.put<Calendar>(`${this.API_URL}/${calendar.id}`, calendar, this.httpOptions)
      : this.http.post<Calendar>(this.API_URL, calendar, this.httpOptions);
    // const add = calendar.id ? this.http.put : this.http.post;
    // const url = calendar.id ? `${this.API_URL}/${calendar.id}` : this.API_URL;
    // return add<Calendar>(url, calendar, this.httpOptions)
    //   .pipe(catchError(this.handleError));
    // return await firstValueFrom<Calendar>(this.http.post<Calendar>(this.API_URL, calendar, this.httpOptions)
    //   .pipe(catchError(this.handleError)))
    // return this.http.post<Calendar>(this.API_URL, calendar, this.httpOptions)
    //   .pipe(catchError(this.handleError));

    return await firstValueFrom<Calendar>(add.pipe(catchError(this.handleError)));
  }
  deleteCalendar(calendar: Calendar): void {
    this.dialogData = calendar;
  }

  getEventCategories(): Observable<string[]> {
    return this.http
      .get<string[]>(`${this.API_URL}/categories`)
      .pipe(catchError(this.handleError));
  }


  handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.log(errorMessage);
    return throwError(errorMessage);
  }
}
