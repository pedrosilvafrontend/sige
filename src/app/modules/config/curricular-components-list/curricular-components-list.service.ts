import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CurricularComponent } from '@models/curricular-component.model';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class CurricularComponentsListService {
  private readonly API_URL = `${environment.baseUrl}/curricular-components`;

  constructor(private httpClient: HttpClient) {}

  getAll(classYearId?: string): Observable<CurricularComponent[]> {
    const url = classYearId ? `${this.API_URL}/year/${classYearId}` : this.API_URL;
    return this.httpClient
      .get<CurricularComponent[]>(url)
      .pipe(catchError(this.handleError));
  }

  addItem(curricularComponent: CurricularComponent): Observable<CurricularComponent> {
    return this.httpClient.post<CurricularComponent>(`${this.API_URL}`, curricularComponent).pipe(
      map((response) => {
        return curricularComponent; // return response from API
      }),
      catchError(this.handleError)
    );
  }

  updateItem(curricularComponent: CurricularComponent): Observable<CurricularComponent> {
    return this.httpClient
      .put<CurricularComponent>(`${this.API_URL}/${curricularComponent.id}`, curricularComponent)
      .pipe(
        map((response) => {
          return curricularComponent; // return response from API
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
