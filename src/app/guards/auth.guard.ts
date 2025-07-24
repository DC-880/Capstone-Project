import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { catchError, map, of } from 'rxjs';


export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.authStatus().pipe(
    map(() => {
      console.log('User authenticated: navigation allowed');
      return true;
    }), 
    catchError(() => of(router.createUrlTree(['/sign-in']))) 
  );
};