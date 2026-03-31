import { Injectable } from '@angular/core';
import { BaseService } from '@services';
import { Work } from '@models';

@Injectable({
  providedIn: 'root'
})
export class WorkService extends BaseService<Work> {

  constructor() {
    super('works')
  }

  // this.updateService.work.set(response);

  approve(work: Work) {
    return this.http.post<Work>(`${this.apiURL}/${work.id}/approve`, work);
  }

  reject(work: Work) {
    return this.http.post<Work>(`${this.apiURL}/${work.id}/reject`, work);
  }

}

