import { inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LocalStorageService, TokenService } from '@services';
import { School } from '@models';
import { MatDialog } from '@angular/material/dialog';

export const tokenInterceptor: HttpInterceptorFn = (request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const tokenService = inject(TokenService);
  const router = inject(Router);
  const store = inject(LocalStorageService);
  const dialog = inject(MatDialog);
  const schoolStoreKey = 'school';
  const classHashStoreKey = 'classHash';
  const handler = () => {
    if (request.url.includes('/logout')) {
      router.navigateByUrl('/login').then();
    }
  };
  const hasHttpScheme = (url: string) => new RegExp('^http(s)?://', 'i').test(url);
  const shouldAppendToken = (url: string) => !hasHttpScheme(url);

  let headers = request.headers;
  if (tokenService.valid() && shouldAppendToken(request.url)) {
    headers = request.headers.append(
      'Authorization',
      tokenService.getBearerToken()
    )
    const school: School | undefined = store.get(schoolStoreKey);
    if (school) {
      headers = headers.append('X-School-ID', String(school.id));
    }

    const classHash: string | undefined = store.get(classHashStoreKey);
    if (typeof classHash === 'string') {
      headers = headers.append('X-Class-Hash', classHash);
    }

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    headers = headers.append('X-Timezone', timezone);
    // headers = headers.append('X-School-ID', store.get(schoolStoreKey) || '');
    return next(
        request.clone({
          headers,
          withCredentials: true,
        })
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            tokenService.clear();
            dialog.closeAll();
          }
          return throwError(error);
        }),
        tap(() => handler())
      );
  }
  else {
    if (request.url.startsWith('/api/')) {
      if (!request.url.startsWith('/api/public/') && !request.url.startsWith('/api/health')) {
        // router.navigateByUrl('/login').then();
        dialog.closeAll();
        return next(request).pipe(tap(() => router.navigateByUrl('/login').then()));
      }
    }
  }
  return next(request).pipe(tap(() => handler()));
}

// @Injectable()
// export class TokenInterceptor implements HttpInterceptor {
//   private hasHttpScheme = (url: string) =>
//     new RegExp('^http(s)?://', 'i').test(url);
//
//   constructor(private tokenService: TokenService, private router: Router) {}
//
//   intercept(
//     request: HttpRequest<unknown>,
//     next: HttpHandler
//   ): Observable<HttpEvent<unknown>> {
//     const handler = () => {
//       if (request.url.includes('/logout')) {
//         this.router.navigateByUrl('/login');
//       }
//     };
//
//     if (this.tokenService.valid() && this.shouldAppendToken(request.url)) {
//       return next
//         .handle(
//           request.clone({
//             headers: request.headers.append(
//               'Authorization',
//               this.tokenService.getBearerToken()
//             ),
//             withCredentials: true,
//           })
//         )
//         .pipe(
//           catchError((error: HttpErrorResponse) => {
//             if (error.status === 401) {
//               this.tokenService.clear();
//             }
//             return throwError(error);
//           }),
//           tap(() => handler())
//         );
//     }
//
//     return next.handle(request).pipe(tap(() => handler()));
//   }
//
//   private shouldAppendToken(url: string) {
//     return !this.hasHttpScheme(url);
//   }
// }
