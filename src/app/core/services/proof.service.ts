import { Injectable } from '@angular/core';
import { BaseService } from '@services';
import { Test } from '@models';

@Injectable({
  providedIn: 'root'
})
export class ProofService extends BaseService<Test> {

  constructor() {
    super('proofs')
  }

  // this.updateService.proof.set(response);

  approve(proof: Test) {
    return this.http.post<Test>(`${this.apiURL}/${proof.id}/approve`, proof);
  }

  reject(proof: Test) {
    return this.http.post<Test>(`${this.apiURL}/${proof.id}/reject`, proof);
  }

}

