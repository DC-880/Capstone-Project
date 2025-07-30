import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {

    const router = inject(Router);

    const cloned = req.clone({
     withCredentials: true
    });
  

  return next(cloned).pipe(
    catchError((error) => {
      if (error.status === 401) {
        console.warn('Unauthorized: Redirecting to login or showing message.');
        router.navigate(['/sign-in']);
      }

      if (error.status === 403) {
        console.warn('Forbidden: Access denied.');
      }
      return throwError(() => error);
    })
  );



};
