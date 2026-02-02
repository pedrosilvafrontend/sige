import { Injectable, OnDestroy } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  Subject,
  Subscription,
  timer,
} from 'rxjs';
import { share } from 'rxjs/operators';
import { BaseToken, JwtToken } from './token';
import { currentTimestamp, filterObject } from './helpers';
import { Token } from '@core/models/interface';
import { LocalStorageService, TokenFactory } from '@services';

@Injectable({
  providedIn: 'root',
})
export class TokenService implements OnDestroy {
  private key = 'redstar-token';

  private change$ = new BehaviorSubject<BaseToken | undefined>(undefined);
  private refresh$ = new Subject<BaseToken | undefined>();
  private timer$?: Subscription;

  private _token?: BaseToken;

  private _roleArray: string[] = [];

  private _permissionArray: string[] = [];

  constructor(
    private store: LocalStorageService,
    private factory: TokenFactory
  ) { }

  private get token(): BaseToken | undefined {
    if (!this._token) {
      this._token = this.factory.create(this.store.get(this.key));

      // Extract roles and permissions if it's a JWT token
      if (this._token && this._token instanceof JwtToken) {
        this._roleArray = this._token.roles;
        this._permissionArray = this._token.permissions;
      }
    }

    return this._token;
  }

  change(): Observable<BaseToken | undefined> {
    return this.change$.pipe(share());
  }

  refresh(): Observable<BaseToken | undefined> {
    this.buildRefresh();

    return this.refresh$.pipe(share());
  }

  set(token?: Token): TokenService {
    this.save(token);

    return this;
  }

  clear(): void {
    this.save();
  }

  valid(): boolean {
    return this.token?.valid() ?? false;
  }

  getBearerToken(): string {
    return this.token?.getBearerToken() ?? '';
  }

  getRefreshToken(): string | void {
    return this.token?.refresh_token;
  }

  ngOnDestroy(): void {
    this.clearRefresh();
  }

  private save(token?: Token): void {
    this._token = undefined;
    if (!token) {
      this.store.remove(this.key);
      this._roleArray = [];
      this._permissionArray = [];
    } else {
      const value = Object.assign(
        { access_token: '', token_type: 'Bearer' },
        token,
        {
          exp: token.expires_in ? currentTimestamp() + token.expires_in : null,
        }
      );
      this.store.set(this.key, filterObject(value));

      // Extract roles and permissions from the token if it's a JWT token
      const newToken = this.factory.create(value);
      if (newToken && newToken instanceof JwtToken) {
        this._roleArray = newToken.roles;
        this._permissionArray = newToken.permissions;
      }
    }
    this.change$.next(this.token);
    this.buildRefresh();
  }

  private buildRefresh() {
    this.clearRefresh();

    if (this.token?.needRefresh()) {
      this.timer$ = timer(this.token.getRefreshTime() * 1000).subscribe(() => {
        this.refresh$.next(this.token);
      });
    }
  }

  private clearRefresh() {
    if (this.timer$ && !this.timer$.closed) {
      this.timer$.unsubscribe();
    }
  }


  public get roleArray(): string[] {
    return this._roleArray;
  }
  public set roleArray(value: []) {
    this._roleArray = value;
  }

  public get permissionArray(): string[] {
    return this._permissionArray;
  }
  public set permissionArray(value: string[]) {
    this._permissionArray = value;
  }
}
