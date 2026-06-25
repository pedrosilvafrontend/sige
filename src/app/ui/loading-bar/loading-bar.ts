import { Component, effect, input, signal, ChangeDetectionStrategy } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'ui-loading-bar',
  imports: [
    MatProgressBarModule
  ],
  templateUrl: './loading-bar.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './loading-bar.scss',
})
export class LoadingBar {
  isLoadingInput = input<boolean>(false, { alias: 'isLoading' })
  isLoading = signal(true);
  timeLoading = 0;
  get loading() {
    return this.isLoading();
  }
  set loading(value: boolean) {
    clearTimeout(this.timeLoading);
    this.timeLoading = setTimeout(() => {
      this.isLoading.set(value);
    }, 3000);
  }

  constructor() {
    effect(() => {
      this.loading = this.isLoadingInput();
    });
  }
}
