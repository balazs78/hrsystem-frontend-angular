import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthTokenService } from '../services/auth-token.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthTokenService).getToken();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  };

  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }

  return next(req.clone({ setHeaders: headers }));
};
