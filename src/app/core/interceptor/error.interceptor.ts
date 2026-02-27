import {
  HttpErrorResponse,
  HttpEvent,
  HttpInterceptorFn
} from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';

export enum STATUS {
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
  OK = 200,
}

const errorPages = [
  STATUS.FORBIDDEN,
  STATUS.NOT_FOUND,
  STATUS.INTERNAL_SERVER_ERROR,
];

const getMessage = (error: HttpErrorResponse) => {
  return error.error?.error || error.error || error.message || `${error.status} ${error.statusText}`
};

const ROUTES = {
  LOGIN: '/login',
  ERROR_PAGE: (status: number) => `/${status}`
} as const;

const getHandleError = (router: Router, snack: MatSnackBar) => {
  return (error: HttpErrorResponse): Observable<never> => {
    const shouldRedirectToErrorPage = errorPages.includes(error.status);

    const err = () => throwError(() => error);

    let message = getMessage(error);
    const regexCode = /^\[[0-9]{3}\]/;
    if (regexCode.test(message)) {
      message = message.replace(regexCode, '');
      logError(error);
      Swal.fire('', message, 'error').then()
      // snack.open(message, 'x');
      return err();
    }
    else if (error.status === STATUS.INTERNAL_SERVER_ERROR) {
      snack.open('Erro interno do servidor.', 'x');
    }

    if (shouldRedirectToErrorPage) {
      const router = inject(Router);
      router.navigateByUrl(ROUTES.ERROR_PAGE(error.status), {
        skipLocationChange: true
      });
    } else {
      logError(error);
      const message = getMessage(error);
      Swal.fire('', message, 'error').then()
      handleUnauthorizedAccess(error);
    }

    return err();
  }
}

const handleUnauthorizedAccess = (error: HttpErrorResponse): void => {
  const router = inject(Router);
  if (error.status === STATUS.UNAUTHORIZED) {
    router.navigateByUrl(ROUTES.LOGIN);
  }
}

const logError = (error: HttpErrorResponse): void => {
  console.error('ERROR', error);
}

export const errorInterceptor: HttpInterceptorFn = (req, next): Observable<HttpEvent<any>> => {
  const snack = inject(MatSnackBar);
  const router = inject(Router);
  const handleError = getHandleError(router, snack);

  return next(req).pipe(
    catchError(
      (error: HttpErrorResponse) => handleError(error)
    )
  );
}
