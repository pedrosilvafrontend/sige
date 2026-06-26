import {
  ApplicationConfig,
  importProvidersFrom, LOCALE_ID,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';

import { routes } from './app.routes';
import { HttpClient, provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { errorInterceptor, responseInterceptor, tokenInterceptor } from '@core/interceptor';
import { provideTranslateService, TranslateLoader, TranslateProviders } from '@ngx-translate/core';
import { provideTranslateHttpLoader, TranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideDateFnsAdapter } from '@angular/material-date-fns-adapter';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { pt } from 'date-fns/locale';
import { ToastrModule } from 'ngx-toastr';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { provideNgxMask } from 'ngx-mask';
import { NgxEditorModule } from 'ngx-editor';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt);

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
    provideHttpClient(withXhr(),
      withInterceptors([
        tokenInterceptor,
        responseInterceptor,
        errorInterceptor
      ])
    ),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: '/i18n/',
        suffix: '.json'
      }),
      fallbackLang: 'pt'
    }),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideDateFnsAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: pt },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    importProvidersFrom(
      ToastrModule.forRoot({
        timeOut: 3000,
        positionClass: 'toast-top-right',
        preventDuplicates: true,
      }),
      NgxEditorModule.forRoot({
        locals: {
          bold: 'Negrito',
          italic: 'Itálico',
          code: 'Código',
          underline: 'Underline',
          // ...
        },
        icons: {
          // bold: '<img src="https://example.com/icon.png" width="15" height="15" alt="">',
        },
      })
    ),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
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
