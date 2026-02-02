import { Injectable } from '@angular/core';
import { BaseService } from '@services';
import { Activity } from '@modules/config/activity/activity.model';
import { catchError, map } from 'rxjs/operators';
import { CountActivitiesResponse } from '@models';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActivityService extends BaseService<Activity> {
  private activities: Activity[] = [];
  private expires = 0;

  constructor() {
    super('activities')
  }

  getCountActivities() {
    return this.http.get<CountActivitiesResponse>(`${this.apiURL}/count`).pipe(
      catchError(this.handleError)
    );
  }

  override getAll(params?: any): Observable<Activity[]> {
    if (this.activities.length > 0 && this.expires > Date.now()) {
      return new Observable<Activity[]>(observer => {
        observer.next(this.activities);
        observer.complete();
      });
    }

    return this.http
      .get<Activity[]>(`${this.apiURL}`, { params })
      .pipe(
        catchError(this.handleError),
        map(activities => {
          this.activities.length = 0;
          this.activities.push(...activities);
          this.expires = Date.now() + 1000 * 60 * 5;
          return activities;
        })
      );
  }

}
