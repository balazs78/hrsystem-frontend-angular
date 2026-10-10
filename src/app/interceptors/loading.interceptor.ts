import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoaderService } from '../services/loader.service';
import { finalize } from 'rxjs';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.headers.get('X-Skip-Loader')) {
    return next(req);
  }

  const loaderService = inject(LoaderService);

  // Show the loader when the request starts
  loaderService.show();

  return next(req).pipe(
    // Finalize runs on success OR error (Crucial!)
    finalize(() => {
      loaderService.hide();
    })
  );
};