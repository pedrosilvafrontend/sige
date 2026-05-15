import { Injectable } from '@angular/core';
import { BaseService } from '@services/base-service';
import { Test } from '@models';

@Injectable({
  providedIn: 'root'
})
export class TestService extends BaseService<Test> {
  constructor() {
    super('tests');
  }
}
