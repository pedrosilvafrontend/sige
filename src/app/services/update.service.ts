import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { Test } from '@models';

@Injectable({
  providedIn: 'root'
})
export class UpdateService {
  public test = signal<Test>(new Test());
  public readonly test$: Observable<Test> = toObservable(this.test);
}
