import { ChangeDetectorRef, Component, effect, inject, input, OnDestroy, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { LoadingService } from '@services/loading.service';

@Component({
  selector: 'app-loader',
  imports: [
    NgClass
  ],
  templateUrl: './loader.html',
  styleUrl: './loader.scss',
})
export class Loader implements OnInit, OnDestroy {
  private cdr = inject(ChangeDetectorRef);
  overlay = input(true);
  loadingService = inject(LoadingService);
  show = input(this.loadingService.isShow());
  isToggled = true;
  intervalId: any;
  currentClass = 'restart-animation';

  get isShow() {
    return this.loadingService.isShow();
  }

  constructor() {
    effect(() => {
      if (this.loadingService.isShow()) {
        console.log('show');
        // this.loadingService.show();
      } else {
        console.log('hide');
        // this.loadingService.hide();
      }
    });
  }

  ngOnInit(): void {
    // Change a boolean property every 1000ms (1 second)
    this.intervalId = setInterval(() => {
      this.isToggled = !this.isToggled;
      // You could also cycle through a list of classes
      this.currentClass = this.isToggled ? 'restart-animation' : 'animationend';
      // console.log(this.isToggled, this.currentClass);
      this.cdr.detectChanges();
    }, 1800);
  }

  ngOnDestroy(): void {
    // CRITICAL: Clear the interval when the component is destroyed
    // to prevent memory leaks.
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
