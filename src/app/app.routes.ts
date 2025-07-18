import { Routes } from '@angular/router';
import { SignIn } from './sign-in/sign-in';
import { Home } from './home/home';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: 'sign-in',
        component: SignIn
    },
    {
        path: 'home',
        component: Home,
        canActivate: [authGuard]
    },
    {
        path: '',
        redirectTo: 'sign-in',
        pathMatch: 'full'
    }
];
