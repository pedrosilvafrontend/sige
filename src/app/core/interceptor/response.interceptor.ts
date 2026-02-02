import {
  HttpEvent,
  HttpInterceptorFn,
  HttpResponse
} from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { inject } from '@angular/core';

export const responseInterceptor: HttpInterceptorFn = (req, next): Observable<HttpEvent<any>> => {
  const toast = inject(ToastrService);
  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        if (event.body?.message) {
          toast.warning(event.body?.message);
        }
      }
    })
  );
}
