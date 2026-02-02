import { Token } from '@core/models/interface';
import { base64, capitalize, currentTimestamp, timeLeft } from './helpers';

export abstract class BaseToken {
  constructor(protected attributes: Token) { }

  get access_token(): string {
    return this.attributes.access_token;
  }

  get refresh_token(): string | void {
    return this.attributes.refresh_token;
  }

  get token_type(): string {
    return this.attributes.token_type ?? 'bearer';
  }

  get exp(): number | void {
    return this.attributes.exp;
  }

  valid(): boolean {
    return this.hasAccessToken() && !this.isExpired();
  }

  getBearerToken(): string {
    return this.access_token
      ? [capitalize(this.token_type), this.access_token].join(' ').trim()
      : '';
  }

  needRefresh(): boolean {
    return this.exp !== undefined && this.exp >= 0;
  }

  getRefreshTime(): number {
    return timeLeft((this.exp ?? 0) - 5);
  }

  private hasAccessToken(): boolean {
    return !!this.access_token;
  }

  private isExpired(): boolean {
    return this.exp !== undefined && this.exp - currentTimestamp() <= 0;
  }
}

export class SimpleToken extends BaseToken { }

export class JwtToken extends SimpleToken {
  private _payload?: any;

  static is(accessToken: string): boolean {
    try {
      const [_header] = accessToken.split('.');
      const header = JSON.parse(base64.decode(_header));

      return header.typ.toUpperCase().includes('JWT');
    } catch (e) {
      return false;
    }
  }

  override get exp(): number | void {
    return this.payload?.exp;
  }

  /**
   * Get the issuer claim from the JWT token
   */
  get issuer(): string | void {
    return this.payload?.iss;
  }

  /**
   * Get the subject claim from the JWT token
   */
  get subject(): string | void {
    return this.payload?.sub;
  }

  /**
   * Get the audience claim from the JWT token
   */
  get audience(): string | void {
    return this.payload?.aud;
  }

  /**
   * Get the issued at claim from the JWT token
   */
  get issuedAt(): number | void {
    return this.payload?.iat;
  }

  /**
   * Get the JWT ID claim from the JWT token
   */
  get jwtId(): string | void {
    return this.payload?.jti;
  }

  /**
   * Get the user information from the JWT token
   */
  get user(): any {
    return this.payload?.user || {};
  }

  /**
   * Get the user roles from the JWT token
   */
  get roles(): string[] {
    return this.payload?.roles || [];
  }

  /**
   * Get the user permissions from the JWT token
   */
  get permissions(): string[] {
    return this.payload?.permissions || [];
  }

  /**
   * Check if the token is a refresh token
   */
  get isRefreshToken(): boolean {
    return !!this.payload?.isRefreshToken;
  }

  /**
   * Get the full payload of the JWT token
   */
  private get payload(): any {
    if (!this.access_token) {
      return {};
    }

    if (this._payload) {
      return this._payload;
    }

    const [, payload] = this.access_token.split('.');
    const data = JSON.parse(base64.decode(payload));
    if (!data.exp) {
      data.exp = this.attributes.exp;
    }

    return (this._payload = data);
  }
}
