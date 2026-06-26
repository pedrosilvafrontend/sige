import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ConfigService } from '@modules/config/config/config.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AsyncPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-footer',
  imports: [
    AsyncPipe,
    DatePipe
  ],
  templateUrl: './footer.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './footer.scss',
})
export class Footer {
  private configService = inject(ConfigService);
  // public data: Partial<AppData> = {};
  data$ = this.configService.getAppVersion().pipe(
    takeUntilDestroyed()
  );

  // constructor() {
  //   this.configService.getAppVersion().pipe(takeUntilDestroyed())
  //     .subscribe(data => this.data = data);
  // }
}
