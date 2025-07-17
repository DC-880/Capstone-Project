import { Routes } from '@angular/router';
import { SignIn } from './sign-in/sign-in';
import { Home } from './home/home';

export const routes: Routes = [
    {
        path: 'sign-in',
        component: SignIn
    },
    {
        path: 'home',
        component: Home
    },

];
