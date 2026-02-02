import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainService } from '@core/main.service';
import { TranslateService } from '@ngx-translate/core';
import defaultLanguage from '@assets/i18n/pt.json';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('sige');
  private main = inject(MainService);
  private translate = inject(TranslateService);

  constructor() {
    this.translate.use('pt');
    this.translate.setTranslation('pt', defaultLanguage, true);
  }
}
