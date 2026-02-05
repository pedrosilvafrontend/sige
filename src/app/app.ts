import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import defaultLanguage from '@assets/i18n/pt.json';
import { LoadingService } from '@services/loading.service';
import { Loader } from '@ui/loader/loader';
import { AuthService } from '@services';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Loader],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('sige');
  private translate = inject(TranslateService);
  private loading = inject(LoadingService);
  private auth = inject(AuthService);

  constructor() {
    this.translate.use('pt');
    this.translate.setTranslation('pt', defaultLanguage, true);
  }

  @HostListener('window:storage', ['$event'])
  onStorageChange(event: StorageEvent) {
    if (!event.key) {
      this.auth.checkSession();
    }
    if (event.key === 'currentUser') {
      if (!event.newValue) {
        this.auth.logout();
        return;
      }
    }
  }

  ngOnInit() {
    this.loading.show('init', 'Loading...');
    setTimeout(() => this.loading.hide('init'), 2000);
  }
}
