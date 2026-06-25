import { Component, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Subject } from 'rxjs';

@Component({ standalone: true, changeDetection: ChangeDetectionStrategy.Eager,
 template: ''})
export class BaseComponent implements OnDestroy {
  protected sub = new Subject<void>();

  ngOnDestroy() {
    this.sub.next();
    this.sub.complete();
  }
}
