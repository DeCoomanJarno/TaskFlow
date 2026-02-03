import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const userId = auth.currentUser?.id;

  if (userId) {
    const updated = req.clone({
      setHeaders: {
        'X-User-Id': String(userId)
      }
    });
    return next(updated);
  }

  return next(req);
};
