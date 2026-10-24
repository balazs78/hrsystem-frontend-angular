import { HttpBackend, HttpClient, HttpEvent, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injector, runInInjectionContext } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { environment } from '../../environments/environment';
import { LoginData } from '../models/login-data.interface';
import { LoginResponse } from '../models/login-response.interface';
import { PasswordChangeData, PasswordChangeResponse } from '../models/user.dto';
import { User } from '../models/user.interface';
import { AuthService } from './auth.service';
import { AuthTokenService } from './auth-token.service';

describe('AuthService', () => {
  let service: AuthService;
  let router: Router;
  let backend: RecordingBackend;
  let tokenService: AuthTokenService;
  let injector: Injector;

  const buildUser = (overrides: Partial<User> = {}): User => ({
    id: 1,
    name: 'Jane Doe',
    email: 'jane@example.com',
    email_verified_at: '',
    password_changed_at: '2024-01-01T00:00:00.000Z',
    role: 'Admin',
    employee_id: 1,
    created_at: '',
    updated_at: '',
    ...overrides
  });

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    backend = new RecordingBackend(() => ({}));
    router = { navigate: vi.fn() } as unknown as Router;
    injector = Injector.create({
      providers: [
        { provide: HttpClient, useValue: new HttpClient(backend) },
        { provide: Router, useValue: router },
        AuthTokenService
      ]
    });
    tokenService = injector.get(AuthTokenService);
    service = runInInjectionContext(injector, () => new AuthService());
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize auth state from the current user endpoint using the stored token', async () => {
    const user = buildUser();
    tokenService.setToken('saved-token', false);
    backend.respond = () => user;

    await service.initialize();

    expect(backend.requests).toHaveLength(1);
    expect(backend.requests[0].method).toBe('GET');
    expect(backend.requests[0].url).toBe(`${environment.apiUrl}/user`);
    expect(backend.requests[0].withCredentials).toBe(false);
    expect(service.currentUser()).toEqual(user);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.role()).toBe('Admin');
    expect(service.isAdmin()).toBe(true);
  });

  it('should skip user hydration when no token is stored', async () => {
    await service.initialize();

    expect(backend.requests).toHaveLength(0);
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should clear an invalid token when user hydration fails', async () => {
    tokenService.setToken('expired-token', true);
    backend.respond = () => {
      throw new Error('Unauthorized');
    };

    await service.initialize();

    expect(tokenService.getToken()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should login from the token and user returned by the login endpoint', () => {
    const user = buildUser();
    const credentials: LoginData = {
      email: 'jane@example.com',
      password: 'secret',
      remember: true
    };
    const loginResponse: LoginResponse = {
      token: 'plain-text-token',
      token_type: 'Bearer',
      user
    };
    backend.respond = () => loginResponse;
    let response: User | undefined;

    service.login(credentials).subscribe(userResponse => {
      response = userResponse;
    });

    expect(backend.requests).toHaveLength(1);
    expect(backend.requests[0].method).toBe('POST');
    expect(backend.requests[0].url).toBe(`${environment.apiUrl}/login`);
    expect(backend.requests[0].body).toEqual(credentials);
    expect(backend.requests[0].withCredentials).toBe(false);
    expect(response).toEqual(user);
    expect(tokenService.getToken()).toBe('plain-text-token');
    expect(localStorage.getItem('auth_token')).toBe('plain-text-token');
    expect(sessionStorage.getItem('auth_token')).toBeNull();
    expect(service.currentUser()).toEqual(user);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.role()).toBe('Admin');
    expect(service.isAdmin()).toBe(true);
  });

  it('should keep a non-remembered token in session storage only', () => {
    tokenService.setToken('temporary-token', false);

    expect(tokenService.getToken()).toBe('temporary-token');
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(sessionStorage.getItem('auth_token')).toBe('temporary-token');
  });

  it('should send a forgot password request', () => {
    service.forgotPassword('jane@example.com').subscribe();

    expect(backend.requests).toHaveLength(1);
    expect(backend.requests[0].url).toBe(`${environment.apiUrl}/forgot-password`);
    expect(backend.requests[0].method).toBe('POST');
    expect(backend.requests[0].body).toEqual({ email: 'jane@example.com' });
  });

  it('should send a password change request without CSRF cookie setup', () => {
    const payload: PasswordChangeData = {
      current_password: 'current-password',
      password: 'new-password',
      password_confirmation: 'new-password'
    };
    backend.respond = () => ({ user: buildUser() });
    let response: PasswordChangeResponse | undefined;

    service.changePassword(payload).subscribe(changeResponse => {
      response = changeResponse;
    });

    expect(backend.requests).toHaveLength(1);
    expect(backend.requests[0].method).toBe('POST');
    expect(backend.requests[0].url).toBe(`${environment.apiUrl}/force-password-update`);
    expect(backend.requests[0].body).toEqual(payload);
    expect(response).toEqual({ user: buildUser() });
  });

  it('should replace the stored token returned by the password change endpoint', () => {
    const payload: PasswordChangeData = {
      current_password: 'current-password',
      password: 'new-password',
      password_confirmation: 'new-password'
    };
    tokenService.setToken('old-token', true);
    backend.respond = () => ({ user: buildUser(), token: 'refreshed-token' });

    service.changePassword(payload).subscribe();

    expect(tokenService.getToken()).toBe('refreshed-token');
    expect(localStorage.getItem('auth_token')).toBe('refreshed-token');
    expect(sessionStorage.getItem('auth_token')).toBeNull();
  });

  it('should preserve session storage when replacing a non-remembered token', () => {
    const payload: PasswordChangeData = {
      current_password: 'current-password',
      password: 'new-password',
      password_confirmation: 'new-password'
    };
    tokenService.setToken('old-token', false);
    backend.respond = () => ({ user: buildUser(), token: 'refreshed-token' });

    service.changePassword(payload).subscribe();

    expect(tokenService.getToken()).toBe('refreshed-token');
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(sessionStorage.getItem('auth_token')).toBe('refreshed-token');
  });

  it('should clear the token and auth state and navigate to login on logout', () => {
    tokenService.setToken('active-token', true);
    const user = buildUser();
    backend.respond = () => ({});
    const navigateSpy = vi.spyOn(router, 'navigate');

    service.currentUser.set(user);
    service.isAuthenticated.set(true);
    service.isAdmin.set(true);
    service.passwordHasChanged.set(true);
    service.role.set('Admin');

    service.logout().subscribe();

    expect(backend.requests).toHaveLength(1);
    expect(backend.requests[0].method).toBe('POST');
    expect(backend.requests[0].url).toBe(`${environment.apiUrl}/logout`);
    expect(backend.requests[0].body).toEqual({});
    expect(backend.requests[0].withCredentials).toBe(false);
    expect(tokenService.getToken()).toBeNull();
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.isAdmin()).toBe(false);
    expect(service.passwordHasChanged()).toBe(false);
    expect(service.role()).toBe('Manager');
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});

class RecordingBackend implements HttpBackend {
  readonly requests: HttpRequest<unknown>[] = [];

  constructor(public respond: (request: HttpRequest<unknown>) => unknown) {}

  handle(request: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
    this.requests.push(request);
    return of(new HttpResponse({ body: this.respond(request) }));
  }
}
