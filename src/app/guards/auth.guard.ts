import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { catchError, map, of } from 'rxjs';


/**
 * A functional route guard that checks for a valid session by calling the backend.
 *
 * This guard is necessary for HttpOnly cookie authentication because the frontend
 * cannot directly read the cookie. It relies on an API endpoint (`/auth-status`)
 * to verify the session.
 *
 * @returns An Observable that resolves to `true` if the user is authenticated,
 * or a `UrlTree` to redirect to the sign-in page if they are not.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.authStatus().pipe(
    map(() => {
      console.log('User authenticated: navigation allowed');
      return true;
    }), // If the request succeeds (2xx status), the user is authenticated.
    catchError(() => of(router.createUrlTree(['/sign-in']))) // If the request fails (401/403), redirect to sign-in.
  );
};