import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorInterceptor, responseInterceptor, tokenInterceptor } from './core/interceptor';
import { provideTranslateService, TranslateModule } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideDateFnsAdapter } from '@angular/material-date-fns-adapter';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { pt } from 'date-fns/locale';
import { ToastrModule } from 'ngx-toastr';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { provideNgxMask } from 'ngx-mask';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'dd/MM/yyyy', // Example: parse 'DD/MM/YYYY'
  },
  display: {
    dateInput: 'dd/MM/yyyy', // Example: display 'DD/MM/YYYY'
    monthYearLabel: 'MMM yyyy',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        tokenInterceptor,
        responseInterceptor,
        errorInterceptor
      ])
    ),
    provideTranslateService({
      lang: 'pt',
      fallbackLang: 'pt',
      loader: provideTranslateHttpLoader({
        prefix: '/i18n/',
        suffix: '.json'
      })
    }),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideDateFnsAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: pt },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    importProvidersFrom(
      ToastrModule.forRoot({
        timeOut: 3000,
        positionClass: 'toast-top-right',
        preventDuplicates: true,
      }),
      TranslateModule.forRoot({
        // loader: {
        //   provide: TranslateLoader,
        //   useFactory: createTranslateLoader,
        //   deps: [HttpClient],
        // },
      }),
    ),
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: {
        horizontalPosition: 'end', // Can be 'start', 'center', 'end', 'left', 'right'
        verticalPosition: 'top',   // Can be 'top' or 'bottom'
        duration: 5000,            // Optional: default duration in milliseconds
      },
    },
    provideNgxMask(),
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: {
        hasBackdrop: true,
        disableClose: false,
        autoFocus: true,
        panelClass: 'sg-dialog',
        minWidth: '400px',
        maxWidth: '96vw',
        height: 'auto'
      },
    }
  ]
};
