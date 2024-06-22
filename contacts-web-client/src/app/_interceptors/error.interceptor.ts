import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  return next(req).pipe(
    catchError((err: any) => {
      if (err instanceof HttpErrorResponse) {
        // Handle HTTP errors
        if (err.status === 401 || err.status === 403 && req.url.indexOf('/login') === -1) {
          // Specific handling for unauthorized errors         
          console.warn('Unauthorized request:', err);
          router.navigate(['login']);
        }
      } else {
        // Handle non-HTTP errors
        console.error('An error occurred:', err);
      }
      // Re-throw the error to propagate it further
      return throwError(() => err);
    })
  );;
};
