import { Component, inject, OnInit } from '@angular/core';
import { ConfigService } from '@modules/config/config/config.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppData } from '@models/app-data';
import { AsyncPipe, DatePipe, JsonPipe } from '@angular/common';

@Component({
  selector: 'app-footer',
  imports: [
    JsonPipe,
    AsyncPipe,
    DatePipe
  ],
  templateUrl: './footer.html',
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
