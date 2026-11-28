import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'payment-success',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/booking/payment-success/payment-success.component').then(
        (m) => m.PaymentSuccessComponent
      ),
  },
  {
    path: 'payment-failed',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/booking/payment-failed/payment-failed.component').then(
        (m) => m.PaymentFailedComponent
      ),
  },
];
