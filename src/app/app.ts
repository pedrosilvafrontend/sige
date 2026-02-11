import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import defaultLanguage from '@assets/i18n/pt.json';
import { LoadingService } from '@services/loading.service';
import { Loader } from '@ui/loader/loader';
import { AuthService, LocalStorageService } from '@services';
import Swal from 'sweetalert2'

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
  private store = inject(LocalStorageService);
  private router = inject(Router);
  gridLessonsKey = 'gridLessons';

  constructor() {
    this.translate.use('pt');
    this.translate.setTranslation('pt', defaultLanguage, true);
    this.onRouteNavigate();
  }

  onRouteNavigate() {
    this.router.events.subscribe((event: any | Event) => {
      if (event instanceof NavigationStart) {
        console.log('Navigation started:', event);
        if (!["/login", "/lessons"].includes(event.url) && this.store.get(this.gridLessonsKey)?.length > 0) {
          Swal.fire({
            title: "Oops...",
            text: 'Grade de aulas não salva, deseja continuar a edição?',
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: "Continuar a edição",
            denyButtonText: `Excluír a edição`
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigate(['/lessons']);
            } else if (result.isDenied) {
              this.store.remove(this.gridLessonsKey);
              Swal.fire("Edição excluída", "", "info");
            }
          });
        }
      }

      if (event instanceof NavigationEnd) {
        // Navigation has completed successfully.
        console.log('Navigation ended:', event.urlAfterRedirects);
        // Example: Hide the loading indicator, perform analytics tracking, etc.
      }

      // You can also check for other events like NavigationError, NavigationCancel, etc.
      // for more comprehensive error handling and UI updates.
    });
  }

  @HostListener('window:storage', ['$event'])
  onStorageChange(event: StorageEvent) {
    this.store.storageChange$.next(event);
    if (!event.key) {
      this.auth.checkSession();
      return;
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
