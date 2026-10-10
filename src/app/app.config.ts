import { APP_INITIALIZER, ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch, withXsrfConfiguration, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideNativeDateAdapter } from '@angular/material/core';

import { routes } from './app.routes';
import { AuthService } from './services/auth.service';
import { loadingInterceptor} from './interceptors/loading.interceptor';

// Helper function to get CSRF token from cookie
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop()!.split(';').shift()!);
  return null;
}

export const appConfig: ApplicationConfig = {
  providers: [
     provideHttpClient(
      withFetch(),
      // 1. Tell Angular to look for the 'XSRF-TOKEN' cookie 
      // and send it back in the 'X-XSRF-TOKEN' header
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN',
      }),
      // 2. Ensure every request includes credentials (cookies)
      withInterceptors([
        (req, next) => {
          const csrfToken = getCookie('XSRF-TOKEN');

          const headers: Record<string, string> = { 
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          };
          
          // Only add CSRF token header if token exists
          if (csrfToken) {
            headers['X-XSRF-TOKEN'] = csrfToken;
          }

          const cloned = req.clone({ 
            withCredentials: true,
            setHeaders: headers
          });
          return next(cloned);
        }, loadingInterceptor
      ])
    ),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    {
      provide: APP_INITIALIZER,
      useFactory: (authService: AuthService) => () => authService.initialize(),
      deps: [AuthService],
      multi: true
    },
    provideNativeDateAdapter()
  ]
};
