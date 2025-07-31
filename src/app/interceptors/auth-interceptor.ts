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
        console.warn('Unauthorized: Redirecting to sign in');
        router.navigate(['/sign-in']);
      }
      return throwError(() => error);
    })
  );



};
