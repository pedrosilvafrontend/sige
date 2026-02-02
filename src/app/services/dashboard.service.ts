import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActivitiesCountResponse } from '@models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly API_URL = `${environment.baseUrl}/dashboard`;

  constructor(private http: HttpClient) { }

  getActivitiesCount(params?: any): Observable<ActivitiesCountResponse> {
    const url = `${this.API_URL}/activities-count`;
    return this.http.get<ActivitiesCountResponse>(url, { params });
  }
}
