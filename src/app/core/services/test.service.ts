import { Injectable } from '@angular/core';
import { BaseService } from '@services';
import { Test } from '@models';
import { Observable, take } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TestService extends BaseService<Test> {

  constructor() {
    super('proofs')
  }

  getByHash(classHash: string, id: number): Observable<Test> {
    const url = `${this.baseUrl}/public/${classHash}/proofs/${id}`;
    return this.http
      .get<Test>(url)
      .pipe(take(1), catchError(this.handleError));
  }

  approve(proof: Test) {
    return this.http.post<Test>(`${this.apiURL}/${proof.id}/approve`, proof);
  }

  reject(proof: Test) {
    return this.http.post<Test>(`${this.apiURL}/${proof.id}/reject`, proof);
  }

}

