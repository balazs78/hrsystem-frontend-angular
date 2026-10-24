import { Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../services/auth.service';
import { HasRoleDirective } from '../directives/has-role.directive';
import { AdminGuard, AuthGuard, GuestGuard, isPasswordChangeRoute, shouldRedirectToPasswordChange } from './auth.guard';

const { mockInject } = vi.hoisted(() => ({
  mockInject: vi.fn()
}));

vi.mock('@angular/core', async () => {
  const actual = await vi.importActual<typeof import('@angular/core')>('@angular/core');
  return {
    ...actual,
    inject: mockInject
  };
});

describe('AuthGuard helpers', () => {
  it('does not redirect when the user is already on the force-password-update route', () => {
    expect(shouldRedirectToPasswordChange(true, { id: 1 }, false, '/force-password-update')).toBe(false);
  });

  it('redirects to the force-password-update route for authenticated users who still need to change their password', () => {
    expect(shouldRedirectToPasswordChange(true, { id: 1 }, false, '/dashboard')).toBe(true);
  });

  it('detects the force-password-update route from its URL', () => {
    expect(isPasswordChangeRoute('/force-password-update')).toBe(true);
    expect(isPasswordChangeRoute('/force-password-update?token=abc')).toBe(true);
    expect(isPasswordChangeRoute('/dashboard')).toBe(false);
  });
});

describe('Redirect guards', () => {
  const parseUrl = vi.fn((url: string) => url);
  const authService: any = {
    isAuthenticated: vi.fn(() => false),
    currentUser: vi.fn(() => null),
    isAdmin: vi.fn(() => false),
    passwordHasChanged: vi.fn(() => false)
  };

  beforeEach(() => {
    parseUrl.mockClear();
    authService.isAuthenticated.mockReturnValue(false);
    authService.currentUser.mockReturnValue(null);
    authService.isAdmin.mockReturnValue(false);
    authService.passwordHasChanged.mockReturnValue(false);
    mockInject.mockImplementation((token: unknown) => {
      if (token === AuthService) {
        return authService;
      }
      if (token === Router) {
        return { parseUrl };
      }
      throw new Error(`Unexpected token: ${String(token)}`);
    });
  });

  it('redirects unauthenticated users to the login page', () => {
    expect(AuthGuard({} as never, { url: '/dashboard' } as never)).toBe('/login');
    expect(parseUrl).toHaveBeenCalledWith('/login');
  });

  it('redirects password-change-required users to the force-password-update page', () => {
    authService.isAuthenticated.mockReturnValue(true);
    authService.currentUser.mockReturnValue({ id: 1 });
    authService.passwordHasChanged.mockReturnValue(false);

    expect(AuthGuard({} as never, { url: '/dashboard' } as never)).toBe('/force-password-update');
    expect(parseUrl).toHaveBeenCalledWith('/force-password-update');
  });

  it('redirects authenticated users away from the login page', () => {
    authService.isAuthenticated.mockReturnValue(true);

    expect(GuestGuard({} as never, { url: '/login' } as never)).toBe('/dashboard');
    expect(parseUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('redirects non-admin users away from admin routes', () => {
    expect(AdminGuard({} as never, { url: '/users' } as never)).toBe('/dashboard');
    expect(parseUrl).toHaveBeenCalledWith('/dashboard');
  });
});

describe('Role authorization', () => {
  it('renders protected content when the user has an allowed role', () => {
    const viewContainer = {
      length: 0,
      createEmbeddedView: vi.fn(),
      clear: vi.fn()
    };

    const directive = Object.create(HasRoleDirective.prototype) as any;
    directive.authService = { role: () => 'Admin' };
    directive.allowedRoles = ['Admin'];
    directive.templateRef = {};
    directive.viewContainer = viewContainer;

    directive.updateView();

    expect(viewContainer.createEmbeddedView).toHaveBeenCalledTimes(1);
    expect(viewContainer.clear).not.toHaveBeenCalled();
  });

  it('hides protected content when the user role is not permitted', () => {
    const viewContainer = {
      length: 1,
      createEmbeddedView: vi.fn(),
      clear: vi.fn()
    };

    const directive = Object.create(HasRoleDirective.prototype) as any;
    directive.authService = { role: () => 'Manager' };
    directive.allowedRoles = ['Admin'];
    directive.viewContainer = viewContainer;

    directive.updateView();

    expect(viewContainer.clear).toHaveBeenCalledTimes(1);
    expect(viewContainer.createEmbeddedView).not.toHaveBeenCalled();
  });
});
