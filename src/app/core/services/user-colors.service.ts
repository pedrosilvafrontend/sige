import { Injectable } from '@angular/core';
import { BaseService } from '@services/base-service';
import { ColorBy, ColorsMap } from '@models/colors-by';
import { Observable, take } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserColorsService extends BaseService<ColorBy> {

  constructor() {
    super('user-colors');
  }

  getMap(params?: any): Observable<ColorsMap> {
    return this.http
      .get<ColorsMap>(`${this.apiURL}/map`, { params })
      .pipe(take(1), catchError(this.handleError));
  }

}
