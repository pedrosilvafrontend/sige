import { Injectable } from '@angular/core';
import { BaseService } from '@services/base-service';
import { TimeSchedule } from '@models';


@Injectable({
  providedIn: 'root'
})
export class TimeScheduleService extends BaseService<TimeSchedule> {

  constructor() {
    super('time-schedules');
  }

  getByTeacher(teacherId: number) {
    return this.http.get<TimeSchedule[]>(`${this.apiURL}/teacher/${teacherId}`);
  }

}
