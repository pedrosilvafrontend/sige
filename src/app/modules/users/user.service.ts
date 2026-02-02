import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, take, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserTable, UserType } from './users.model';
import { environment } from '@env/environment';
import { User, CRUD, UserSchoolAssociation } from '@models';
import { AuthService } from '@services';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // private readonly API_URL = 'assets/data/advanceTable.json';
  private readonly API_URL = `${environment.baseUrl}/users`;
  private readonly PUBLIC_API_URL = `${environment.baseUrl}/public`;
  public allowedRoles: CRUD<UserType[]> = {
    create: ['admin', 'association', 'coordinator', 'principal'],
    read: ['admin', 'association', 'coordinator', 'principal'],
    update: ['admin', 'association', 'coordinator', 'principal'],
    delete: ['admin', 'association', 'coordinator', 'principal'],
  }

  constructor(
    private httpClient: HttpClient,
    private authService: AuthService
  ) {
  }

  get user(): User {
    return this.authService.user$.value;
  }

  /** GET: Fetch all items */
  getAll(role?: UserType | 'managers'): Observable<User[]> {
    const allowed = this.allowedRoles.read.includes(this.user.role as UserType);
    if (!allowed) {
      return this.getById(this.user.id as any).pipe(map(user => [user]));
    }

    const url = role ? `${this.API_URL}/role/${role}` : this.API_URL;
    return this.httpClient
      .get<UserTable[]>(url);
  }

  getTeachersByClassHash(classHash: string): Observable<User[]> {
    return this.httpClient
      .get<User[]>( `${this.PUBLIC_API_URL}/teachers/${classHash}`)
      .pipe(take(1), catchError(this.handleError));
  }

  getTeachersBySchool(schoolId: number): Observable<User[]> {
    const url = schoolId ? `${this.API_URL}/school/${schoolId}/role/teacher` : `${this.API_URL}/role/teacher`;
    return this.httpClient
      .get<User[]>(url)
      .pipe(take(1));
  }

  getById(id: number): Observable<User> {
    return this.httpClient
      .get<User>(`${this.API_URL}/${id}`)
      .pipe(take(1), catchError(this.handleError));
  }

  /** POST: Add a new item */
  addItem(user: UserTable): Observable<UserTable> {
    return this.httpClient.post<UserTable>(this.API_URL, user).pipe(
      take(1),
      map((response) => {
        return user; // return response from API
      }),
      catchError(this.handleError)
    );
  }

  /** PUT: Update an existing item */
  updateItem(item: UserTable): Observable<UserTable> {
    return this.httpClient
      .put<UserTable>(`${this.API_URL}/${item.id}`, item)
      .pipe(
        take(1),
        map((response) => {
          return item; // return response from API
        }),
        catchError(this.handleError)
      );
  }

  /** DELETE: Remove item by ID */
  deleteItem(id: number): Observable<number> {
    return this.httpClient.delete<void>(`${this.API_URL}/${id}`).pipe(
      take(1),
      map((response) => {
        return id; // return response from API
      }),
      catchError(this.handleError)
    );
  }

  getSchoolOrAssociation(): Observable<UserSchoolAssociation[]> {
    return this.httpClient
      .get<UserSchoolAssociation[]>(`${this.API_URL}/school-or-association`)
      .pipe(take(1), catchError(this.handleError));
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
