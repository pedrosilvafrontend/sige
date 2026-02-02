import { Injectable } from '@angular/core';
import { BaseService } from '@services/base-service';
import { Proof } from '@models';

@Injectable({
  providedIn: 'root'
})
export class TestService extends BaseService<Proof> {
  constructor() {
    super('tests');
  }
}
