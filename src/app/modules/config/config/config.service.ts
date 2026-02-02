import { Injectable } from '@angular/core';
import { BaseService } from '@services';
import { BehaviorSubject, Observable, take } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ConfigData, ConfigResponse } from '@models/config.model';

@Injectable({
  providedIn: 'root'
})
export class ConfigService extends BaseService<ConfigData> {
  // config!: ConfigResponse;
  config = new BehaviorSubject<ConfigResponse | null>(null);
  constructor() {
    super('config');
  }

  getConfig(params?: any): Observable<ConfigResponse> {
    return this.http
      .get<ConfigResponse>(`${this.apiURL}`, { params })
      .pipe(take(1), catchError(this.handleError));
  }

  // override update(item: ConfigData): Observable<ConfigResponse> {
  //   if (item.school.id)
  //
  //   const id = item ? (item as any)?.id : item;
  //   return this.http
  //     .put<ConfigResponse>(`${this.apiURL}/${id}`, item)
  //     .pipe(
  //       take(1),
  //       map((response) => {
  //         return item; // return response from API
  //       }),
  //       catchError(this.handleError)
  //     );
  // }


  getSchoolConfig(schoolId?: number): Observable<ConfigData> {
    if (this.config.value?.school) {
      const school = this.config.value.school;
      if (schoolId && school.schoolId == schoolId) {
        return this.config.pipe(map((cfg) => cfg!.school as ConfigData));
      }
    }
    return this.getConfig({schoolId}).pipe(
      take(1),
      map((cfg) => {
        this.config.next(cfg);
        return cfg.school;
      })
    );
  }
}
