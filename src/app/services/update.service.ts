import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { Proof } from '@models';

@Injectable({
  providedIn: 'root'
})
export class UpdateService {
  public proof = signal<Proof>(new Proof());
  public readonly proof$: Observable<Proof> = toObservable(this.proof);
}
