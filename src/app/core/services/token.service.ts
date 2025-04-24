import { Injectable } from '@angular/core';
import { JwtToken } from '../../shared/types/token.type';

const TOKEN_KEY = 'access_key';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  getToken(): JwtToken | null {
    const match = document.cookie.match(new RegExp('(^| )' + TOKEN_KEY + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  setToken(token: JwtToken, options?: { expires?: number | Date; secure?: boolean }): void {
    const parts = [`${TOKEN_KEY}=${encodeURIComponent(token)}`];

    if (options?.expires) {
      const expires =
        typeof options.expires === 'number'
          ? new Date(Date.now() + options.expires * 1000)
          : options.expires;
      parts.push(`expires=${expires.toUTCString()}`);
    }

    parts.push('path=/');

    if (options?.secure !== false) {
      parts.push('Secure');
    }

    document.cookie = parts.join('; ');
  }

  clearToken(): void {
    document.cookie = `${TOKEN_KEY}=; Max-Age=0; path=/; Secure`;
  }

  getTokenExpiration(): number | null {
    const token = this.getToken();
    if (!token) return null;

    const payload = this.decodePayload(token);
    return payload?.exp ?? null;
  }

  isTokenExpired(): boolean {
    const exp = this.getTokenExpiration();
    if (!exp) return true;

    const nowInSeconds = Math.floor(Date.now() / 1000);
    return nowInSeconds >= exp;
  }

  private decodePayload(token: string): { exp: number } | null {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }
}
