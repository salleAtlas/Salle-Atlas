import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, MatToolbarModule, MatButtonModule],
  template: `
    <mat-toolbar color="primary">
      <a routerLink="/" style="color: inherit; text-decoration: none; font-weight: 600;">
        Salle Atlas
      </a>
      <span style="flex: 1 1 auto;"></span>
      <a mat-button routerLink="/search">Spaces</a>
      @if (authService.isAuthenticated()) {
        <a mat-button routerLink="/my-reservations">My Reservations</a>
        <span style="font-size: 0.9rem; margin: 0 8px;">
          Hello, {{ authService.currentUser()?.first_name || 'Client' }}
        </span>
        <button mat-button (click)="logout()">Logout</button>
      } @else {
        <a mat-button routerLink="/login">Login</a>
        <a mat-button routerLink="/register">Register</a>
      }
    </mat-toolbar>
  `,
})
export class NavbarComponent {
  readonly authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}
