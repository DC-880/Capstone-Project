import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {

    const cloned = req.clone({
     withCredentials: true
    });
  

  return next(cloned).pipe(
    catchError((error) => {
      if (error.status === 401) {
        console.warn('Unauthorized: Redirecting to login or showing message.');
        // Optionally: redirect to login
        // router.navigate(['/login']);
      }

      if (error.status === 403) {
        console.warn('Forbidden: Access denied.');
      }

      // You can customize or rethrow
      return throwError(() => error);
    })
  );



};
