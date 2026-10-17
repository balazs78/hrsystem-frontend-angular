import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthTokenService {
  private readonly storageKey = 'auth_token';

  getToken(): string | null {
    return localStorage.getItem(this.storageKey) ?? sessionStorage.getItem(this.storageKey);
  }

  setToken(token: string, remember: boolean): void {
    this.clearToken();
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(this.storageKey, token);
  }

  clearToken(): void {
    localStorage.removeItem(this.storageKey);
    sessionStorage.removeItem(this.storageKey);
  }
}
