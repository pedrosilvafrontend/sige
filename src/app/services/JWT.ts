import { User } from "@core/models/interface";
import { base64, currentTimestamp, filterObject } from "./helpers";
import { HttpRequest } from "@angular/common/http";
import { environment } from "@env/environment";

export class JWT {
    private readonly secret: string;
    private readonly expiresIn: number;
    private readonly refreshExpiresIn: number;
    private readonly issuer: string;
    private readonly audience: string;

    constructor() {
        this.secret = environment.jwt.secret;
        this.expiresIn = environment.jwt.expiresIn;
        this.refreshExpiresIn = environment.jwt.refreshExpiresIn;
        this.issuer = environment.jwt.issuer;
        this.audience = environment.jwt.audience;
    }

    async generate(user: User) {
      return filterObject({
        access_token: await this.createToken(user, this.expiresIn),
        token_type: 'bearer',
        expires_in: this.expiresIn,
        refresh_token: user['refresh_token']
          ? await this.createToken(user, this.refreshExpiresIn, true)
          : undefined,
      });
    }

    getUser(req: HttpRequest<any>) {
        let token = '';
        if (req.body?.refresh_token) {
            token = req.body.refresh_token;
        } else if (req.headers.has('Authorization')) {
            const authorization = req.headers.get('Authorization');
            const result = (authorization as string).split(' ');
            token = result[1];
        }

        try {
            if (!this.verifyToken(token)) {
                return null;
            }

            const data = JWT.parseToken(token);
            const now = new Date();

            return JWT.isExpired(data, now) ? null : data.user;
        } catch (e) {
            return null;
        }
    }

    async createToken(user: User, expiresIn = 0, isRefresh = false) {
        const now = currentTimestamp();
        const exp = now + expiresIn;
        const jti = await this.generateTokenId();

      // Create standard JWT claims
        const payload = {
            iss: this.issuer,                // Issuer
            sub: user.id?.toString() || '',  // Subject (user ID)
            aud: this.audience,              // Audience
            exp: exp,                        // Expiration time
            iat: now,                        // Issued at
            nbf: now,                        // Not valid before
            jti: jti,                         // JWT ID (unique identifier)

            // Custom claims
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            },
            roles: user['roles'] || [],
            permissions: user['permissions'] || [],
            isRefreshToken: isRefresh
        };

        // Create JWT parts
        const header = { typ: 'JWT', alg: 'HS256' };
        const headerEncoded = base64.encode(JSON.stringify(header));
        const payloadEncoded = base64.encode(JSON.stringify(filterObject(payload)));

        // Create signature
        const signature = await this.sign(`${headerEncoded}.${payloadEncoded}`, this.secret);

        return `${headerEncoded}.${payloadEncoded}.${signature}`;
    }

  async verifyToken(token: string): Promise<boolean> {
    try {
      const [headerEncoded, payloadEncoded, signatureProvided] = token.split('.');

      // Verificar assinatura (agora com await)
      const signature = await this.sign(`${headerEncoded}.${payloadEncoded}`, this.secret);

      return signature === signatureProvided;
    } catch (e) {
      return false;
    }
  }


  private async sign(data: string, secret: string): Promise<string> {
      const encoder = new TextEncoder();
      const keyData = encoder.encode(secret);
      const messageData = encoder.encode(data);

      // Criar uma chave a partir do secret
      const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        {
          name: 'HMAC',
          hash: 'SHA-256'
        },
        false,
        ['sign']
      );

      // Criar a assinatura
      const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        messageData
      );

      // Converter o ArrayBuffer para string base64
      const signatureArray = Array.from(new Uint8Array(signature));
      const binaryString = String.fromCharCode.apply(null, signatureArray);
      return base64.encode(binaryString);
    }

    // private generateTokenId(): string {
    //     return randomBytes(16).toString('hex');
    // }

    private async generateTokenId(): Promise<string> {
      const array = new Uint8Array(16);
      crypto.getRandomValues(array);
      return Array.from(array)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    }


    private static parseToken(accessToken: string) {
        const [, payload] = accessToken.split('.');
        return JSON.parse(base64.decode(payload));
    }

    private static isExpired(data: any, now: Date) {
        const expiresIn = new Date();
        expiresIn.setTime(data.exp * 1000);
        const diff = this.dateToSeconds(expiresIn) - this.dateToSeconds(now);

        return diff <= 0;
    }

    private static dateToSeconds(date: Date) {
        return Math.ceil(date.getTime() / 1000);
    }
}
