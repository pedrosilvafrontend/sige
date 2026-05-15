import { Injectable } from '@angular/core';
import { BaseService } from '@services';
import { Activity } from '@modules/config/activity/activity.model';
import { catchError, map } from 'rxjs/operators';
import { CountActivitiesResponse } from '@models';
import { firstValueFrom, Observable, of, take } from 'rxjs';
import { RequestCache } from '@util';

@Injectable({
  providedIn: 'root'
})
export class ActivityService extends BaseService<Activity> {
  private activities: Activity[] = [];
  private expires = 0;
  cache = {
    getAll: new RequestCache<Activity[]>()
  }

  constructor() {
    super('activities')
  }

  getCountActivities() {
    return this.http.get<CountActivitiesResponse>(`${this.apiURL}/count`).pipe(
      catchError(this.handleError)
    );
  }

  async getMap(params?: any): Promise<Map<string, Activity>> {
    const activities = await firstValueFrom(this.getAll(params));
    const mapped = new Map<string, Activity>();
    for (const activity of (activities || [])) {
      mapped.set(activity.id, activity);
    }
    return mapped;
  }

  override getAll(params?: any): Observable<Activity[]> {
    const classHash = params?.classHash;
    if (classHash) {
      delete params.classHash;
    }
    const url = classHash ? `${this.baseUrl}/public/${classHash}/activities` : `${this.apiURL}`;
    const cachedValue = this.cache.getAll.getCache(url, params);
    if (cachedValue) {
      return of(cachedValue);
    }

    // if (this.activities.length > 0 && this.expires > Date.now()) {
    //   return new Observable<Activity[]>(observer => {
    //     observer.next(this.activities);
    //     observer.complete();
    //   });
    // }

    return this.http
      .get<Activity[]>(url, { params })
      .pipe(
        take(1),
        catchError(this.handleError),
        map(activities => {
          if (!activities) {
            activities = [];
          }
          this.activities.length = 0;
          this.activities.push(...activities);
          // this.expires = Date.now() + 1000 * 60 * 5;
          this.cache.getAll.setCache(activities);
          return activities;
        })
      );
  }

}
