import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Component({ standalone: true, template: ''})
export class BaseComponent implements OnDestroy {
  protected sub = new Subject<void>();

  ngOnDestroy() {
    console.log('>>> BASE DESTROY');
    this.sub.next();
    this.sub.complete();
  }
}
