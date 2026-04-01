import { Component, effect, input, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'ui-skeleton',
  imports: [
    NgTemplateOutlet
  ],
  templateUrl: './skeleton.html',
  styleUrl: './skeleton.scss',
})
export class Skeleton {
  /**
   * @description
   * The type of skeleton to display. Can be 'list' or 'card'.
   */
  type = input<string>('list');
  isLoading = signal(true);
  loading = input(true);
  initOn = +new Date();

  constructor() {
    effect(() => {
      const loading = this.loading();
      if (!loading && (+new Date() - this.initOn < 1000)) {
        setTimeout(() => this.isLoading.set(false), 500);
        return;
      }
      this.isLoading.set(loading);
    });

    // setTimeout(() => this.isLoading.set(false), 3000);
  }

  // set loading(value: boolean) {
  //   console.log('>>> set loading', value);
  //   console.log('>>> +Date() - this.initOn', +new Date(), this.initOn, +new Date() - this.initOn);
  //   if (!value && (+new Date() - this.initOn < 1000)) {
  //     setTimeout(() => this.isLoading.set(false), 1000);
  //     return;
  //   }
  //   this.isLoading.set(value);
  // }

}
