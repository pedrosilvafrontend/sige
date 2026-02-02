import { Injectable } from '@angular/core';
import { BaseService } from '@services/base-service';
import { Work } from '@models';

@Injectable({
  providedIn: 'root'
})
export class WorkService extends BaseService<Work> {
  constructor() {
    super('work');
  }
}
