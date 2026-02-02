import { Injectable } from '@angular/core';
import { BaseService } from '@services';
import { Proof } from '@models';

@Injectable({
  providedIn: 'root'
})
export class ProofService extends BaseService<Proof> {

  constructor() {
    super('proofs')
  }

  // this.updateService.proof.set(response);

  approve(proof: Proof) {
    return this.http.post<Proof>(`${this.apiURL}/${proof.id}/approve`, proof);
  }

  reject(proof: Proof) {
    return this.http.post<Proof>(`${this.apiURL}/${proof.id}/reject`, proof);
  }

}

