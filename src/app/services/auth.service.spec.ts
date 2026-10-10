import { HttpBackend, HttpClient, HttpEvent, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injector, runInInjectionContext } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { environment } from '../../environments/environment';
import { LoginData } from '../models/login-data.interface';
import { PasswordChangeData, PasswordChangeResponse } from '../models/user.dto';
import { User } from '../models/user.interface';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let router: Router;
  let backend: RecordingBackend;
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
    backend = new RecordingBackend(() => ({}));
    router = { navigate: vi.fn() } as unknown as Router;
    injector = Injector.create({
      providers: [
        { provide: HttpClient, useValue: new HttpClient(backend) },
        { provide: Router, useValue: router }
      ]
    });
    service = runInInjectionContext(injector, () => new AuthService());
    vi.stubGlobal('document', { cookie: 'XSRF-TOKEN=csrf-token' });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize auth state from the current user endpoint', async () => {
    const user = buildUser();
    backend.respond = () => user;

    const initializePromise = service.initialize();
    await initializePromise;

    expect(backend.requests).toHaveLength(1);
    expect(backend.requests[0].method).toBe('GET');
    expect(backend.requests[0].url).toBe(`${environment.apiUrl}/user`);
    expect(backend.requests[0].withCredentials).toBe(true);
    expect(service.currentUser()).toEqual(user);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.role()).toBe('Admin');
    expect(service.isAdmin()).toBe(true);
  });

  it('should login and hydrate auth state from the user endpoint', () => {
    const user = buildUser();
    const credentials: LoginData = {
      email: 'jane@example.com',
      password: 'secret',
      remember: true
    };
    backend.respond = request => request.url.endsWith('/user') ? user : {};
    let response: User | undefined;

    service.login(credentials).subscribe(userResponse => {
      response = userResponse;
    });

    expect(backend.requests.map(request => [request.method, request.url])).toEqual([
      ['GET', `${environment.webUrl}/sanctum/csrf-cookie`],
      ['POST', `${environment.webUrl}/login`],
      ['GET', `${environment.apiUrl}/user`]
    ]);
    expect(backend.requests[1].body).toEqual(credentials);
    expect(backend.requests[1].headers.get('X-XSRF-TOKEN')).toBe('csrf-token');
    expect(backend.requests[1].withCredentials).toBe(true);

    expect(response).toEqual(user);
    expect(service.currentUser()).toEqual(user);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.role()).toBe('Admin');
    expect(service.isAdmin()).toBe(true);
  });

  it('should send a forgot password request', () => {
    service.forgotPassword('jane@example.com').subscribe();

    expect(backend.requests).toHaveLength(1);
    expect(backend.requests[0].url).toBe(`${environment.webUrl}/forgot-password`);
    expect(backend.requests[0].method).toBe('POST');
    expect(backend.requests[0].body).toEqual({ email: 'jane@example.com' });
  });

  it('should send a password change request with the CSRF token', () => {
    const payload: PasswordChangeData = {
      current_password: 'current-password',
      password: 'new-password',
      password_confirmation: 'new-password'
    };
    backend.respond = request => request.url.endsWith('/force-password-update')
      ? { user: buildUser() }
      : {};
    let response: PasswordChangeResponse | undefined;

    service.changePassword(payload).subscribe(changeResponse => {
      response = changeResponse;
    });

    const changeResponse: PasswordChangeResponse = { user: buildUser() };
    expect(backend.requests.map(request => [request.method, request.url])).toEqual([
      ['GET', `${environment.webUrl}/sanctum/csrf-cookie`],
      ['POST', `${environment.webUrl}/force-password-update`]
    ]);
    expect(backend.requests[1].headers.get('X-XSRF-TOKEN')).toBe('csrf-token');
    expect(backend.requests[1].body).toEqual(payload);
    expect(backend.requests[1].withCredentials).toBe(true);

    expect(response).toEqual(changeResponse);
  });

  it('should clear auth state and navigate to login on logout', () => {
    const user = buildUser();
    backend.respond = () => ({});
    const navigateSpy = vi.spyOn(router, 'navigate');

    service.currentUser.set(user);
    service.isAuthenticated.set(true);
    service.isAdmin.set(true);
    service.passwordHasChanged.set(true);
    service.role.set('Admin');

    service.logout().subscribe();

    expect(backend.requests.map(request => [request.method, request.url])).toEqual([
      ['GET', `${environment.webUrl}/sanctum/csrf-cookie`],
      ['POST', `${environment.webUrl}/logout`]
    ]);
    expect(backend.requests[1].headers.get('X-XSRF-TOKEN')).toBe('csrf-token');
    expect(backend.requests[1].body).toEqual({});
    expect(backend.requests[1].withCredentials).toBe(true);

    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.isAdmin()).toBe(false);
    expect(service.passwordHasChanged()).toBe(false);
    expect(service.role()).toBe('Admin');
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
