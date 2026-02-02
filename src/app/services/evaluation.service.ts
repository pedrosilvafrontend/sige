import { Injectable, signal } from '@angular/core';
import { BaseService } from '@services/base-service';
import { EvaluationCriterion, EvaluationItem } from '@models';
import { concat, Observable, of, take } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

class RequestedData<T> {
  uri: string;
  readonly data: T;
  expiration: number;

  constructor(url: string, params: any, data: T, expiration?: number) {
    this.uri = params ? `${url}?${new URLSearchParams(params).toString()}` : url || '';
    this.data = data;
    this.expiration = expiration || +new Date() + 1000 * 60;
  }

  getData(url: string, params: any) {
    if (this.expiration < +new Date()) {
      return null;
    }
    const equal = this.uri === (params ? `${url}?${new URLSearchParams(params).toString()}` : url || '');
    return equal ? of(this.data).pipe(take(1)) : null;
  }
}

@Injectable({
  providedIn: 'root'
})
export class EvaluationService extends BaseService<EvaluationItem> {
  constructor() {
    super('evaluation-topics');
  }
}

@Injectable({
  providedIn: 'root'
})
export class EvaluationCriterionService extends BaseService<EvaluationCriterion> {
  // private _evaluationCriteria = signal([] as EvaluationCriterion[]);
  // readonly evaluationCriteria = this._evaluationCriteria.asReadonly();
  private getAllData = signal<RequestedData<EvaluationCriterion[]>>(new RequestedData('', null, []));

  constructor() {
    super('evaluation-criteria');
    // this.getAll({ deft: true }).subscribe(criteria => {
    //   this._evaluationCriteria.set(criteria);
    // })
  }


  override getAll(params: any): Observable<EvaluationCriterion[]> {
    if (!params.schoolId) {
      console.warn('EvaluationCriterionService: getAll() called without schoolId. Returning empty array.')
      return of([]).pipe(take(1));
    }
    const url = `${this.apiURL}/school/${params.schoolId}`;
    return this.getAllData().getData(url, params) || this.http
      .get<EvaluationCriterion[]>(url, { params })
      .pipe(
        take(1),
        catchError(this.handleError),
        tap((data) => this.getAllData.set(new RequestedData<EvaluationCriterion[]>(this.apiURL, params, data)))
      );
  }

  // getCriteria() {
  //   this.getAll().subscribe();
  //   return this.getAllData.asReadonly();
  // }


  addMultiple(items: EvaluationCriterion[]) {
    return concat(...items.map(item => this.add(item)));
  }
}
