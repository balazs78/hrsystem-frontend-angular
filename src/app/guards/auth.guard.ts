import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const isPasswordChangeRoute = (url: string): boolean => url.startsWith('/force-password-update');

export const shouldRedirectToPasswordChange = (
  isAuthenticated: boolean,
  currentUser: unknown,
  passwordHasChanged: boolean,
  url: string
): boolean => {
  const hasSession = isAuthenticated || !!currentUser;
  return hasSession && !passwordHasChanged && !isPasswordChangeRoute(url);
};

const authenticateRoute = (url: string): boolean | ReturnType<Router['parseUrl']> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (
    shouldRedirectToPasswordChange(
      authService.isAuthenticated(),
      authService.currentUser(),
      authService.passwordHasChanged(),
      url
    )
  ) {
    return router.parseUrl('/force-password-update');
  }

  // If we already know the user is authenticated, allow access
  if (authService.isAuthenticated() || authService.currentUser()) {
    return true;
  }

  // Otherwise, redirect to login
  // Note: router.parseUrl is the modern way to redirect from a guard
  return router.parseUrl('/login');
};

/** Prevents unauthenticated users from accessing private routes. */
export const AuthGuard: CanActivateFn = (_route, state) => authenticateRoute(state.url);

/** Rechecks authentication and password status during navigation between child routes. */
export const AuthChildGuard: CanActivateChildFn = (_childRoute, state) => authenticateRoute(state.url);

export const GuestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() || authService.currentUser()) {
    return router.parseUrl('/dashboard');
  }

  return true;
};

/**
 * Role-Based Guard (Admin Only)
 * Prevents Managers from accessing Admin pages.
 */
export const AdminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAdmin()) {
    return true;
  }

  // If not admin, send them back to the dashboard
  return router.parseUrl('/dashboard');
};