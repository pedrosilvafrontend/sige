import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

import { Observable } from 'rxjs';
import { LocalStorageService } from '@services';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(
    private router: Router,
    private store: LocalStorageService
  ) {}
  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    return this.canActivate(route, state);
  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> | Promise<boolean> {
    const currentUser = this.store.get('currentUser');

    if (currentUser?.id) {
      if (state.url == '/managers' && !['admin', 'principal', 'coordinator', 'association'].includes(currentUser.role)) {
        return false;
      }
      if (state.url == '/admin' && currentUser.role != 'admin') {
        return false;
      }
      return true;
    } else {
      if (state.url.startsWith('/public/')) {
        return true;
      }
      // Redirect to the login page if the user is not authenticated
      this.router.navigate(['/login']);
      return false;
    }
  }
}
