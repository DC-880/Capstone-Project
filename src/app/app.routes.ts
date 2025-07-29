import { Routes } from '@angular/router';
import { SignIn } from './sign-in/sign-in';
import { Home } from './home/home';
import { authGuard } from './guards/auth.guard';
import { PaymentTracking } from './payment-tracking/payment-tracking';
import { ClientManagement } from './client-management/client-management';
import { InvoiceCreation } from './invoice-creation/invoice-creation';
import { Verify } from './verify/verify';


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
    },
    {
        path: 'payment-tracking',
        component: PaymentTracking,
        canActivate: [authGuard]
        
    },
    {
        path: 'client-management',
        component: ClientManagement,
        canActivate: [authGuard]
    },
    {
        path: 'invoice-creation',
        component: InvoiceCreation,
        canActivate: [authGuard]
    },
    {
        path: 'verify/:id',
        component: Verify,
    }
];
