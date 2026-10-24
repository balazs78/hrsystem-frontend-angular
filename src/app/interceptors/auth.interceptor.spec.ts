import { HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injector, runInInjectionContext } from '@angular/core';
import { of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { AuthTokenService } from '../services/auth-token.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let tokenService: AuthTokenService;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    tokenService = Injector.create({ providers: [AuthTokenService] }).get(AuthTokenService);
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('adds a bearer authorization header when a token is stored', () => {
    tokenService.setToken('access-token', false);
    const request = new HttpRequest('GET', '/api/users');
    let forwardedRequest: HttpRequest<unknown> | undefined;
    const next: HttpHandlerFn = req => {
      forwardedRequest = req;
      return of(new HttpResponse());
    };

    runInInjectionContext(Injector.create({ providers: [AuthTokenService] }), () =>
      authInterceptor(request, next)
    );

    expect(forwardedRequest?.headers.get('Authorization')).toBe('Bearer access-token');
    expect(forwardedRequest?.headers.has('X-XSRF-TOKEN')).toBe(false);
    expect(forwardedRequest?.withCredentials).toBe(false);
  });

  it('does not add an authorization header when no token is stored', () => {
    const request = new HttpRequest('GET', '/api/users');
    let forwardedRequest: HttpRequest<unknown> | undefined;
    const next: HttpHandlerFn = req => {
      forwardedRequest = req;
      return of(new HttpResponse());
    };

    runInInjectionContext(Injector.create({ providers: [AuthTokenService] }), () =>
      authInterceptor(request, next)
    );

    expect(forwardedRequest?.headers.has('Authorization')).toBe(false);
    expect(forwardedRequest?.headers.get('Accept')).toBe('application/json');
  });
});
