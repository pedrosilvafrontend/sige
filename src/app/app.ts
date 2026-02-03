import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainService } from '@core/main.service';
import { TranslateService } from '@ngx-translate/core';
import defaultLanguage from '@assets/i18n/pt.json';
import { LoadingService } from '@services/loading.service';
import { Loader } from '@ui/loader/loader';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Loader],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('sige');
  private main = inject(MainService);
  private translate = inject(TranslateService);
  private loading = inject(LoadingService);

  constructor() {
    this.translate.use('pt');
    this.translate.setTranslation('pt', defaultLanguage, true);
  }

  ngOnInit() {
    this.loading.show('init', 'Loading...');
    setTimeout(() => this.loading.hide('init'), 2000);
  }
}
