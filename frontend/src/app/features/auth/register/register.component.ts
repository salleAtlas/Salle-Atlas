import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="register-container">
      <mat-card class="register-card">
        <mat-card-header>
          <mat-card-title>Create an Account</mat-card-title>
          <mat-card-subtitle>Sign up to reserve meeting rooms and coworking spaces</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <!-- Error alert -->
          <div *ngIf="errorMessage" class="alert alert-error">
            {{ errorMessage }}
          </div>

          <!-- Success alert -->
          <div *ngIf="successMessage" class="alert alert-success">
            {{ successMessage }}
            <div style="margin-top: 0.5rem;">
              <a mat-stroked-button color="primary" routerLink="/login">Proceed to Login</a>
            </div>
          </div>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" *ngIf="!successMessage">
            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>First Name</mat-label>
                <input matInput formControlName="first_name" placeholder="John" />
                <mat-error *ngIf="registerForm.get('first_name')?.hasError('required')">
                  First name is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Last Name</mat-label>
                <input matInput formControlName="last_name" placeholder="Doe" />
                <mat-error *ngIf="registerForm.get('last_name')?.hasError('required')">
                  Last name is required
                </mat-error>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email Address</mat-label>
              <input matInput type="email" formControlName="email" placeholder="john.doe@example.com" />
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="registerForm.get('email')?.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
                Please enter a valid email address
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Phone Number (Optional)</mat-label>
              <input matInput type="tel" formControlName="phone" placeholder="+33612345678" />
              <mat-icon matSuffix>phone</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input
                matInput
                [type]="hidePassword ? 'password' : 'text'"
                formControlName="password"
                placeholder="At least 8 characters"
              />
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="hidePassword = !hidePassword"
                [attr.aria-label]="'Hide password'"
              >
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
              <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
                Password must be at least 8 characters
              </mat-error>
            </mat-form-field>

            <button
              mat-raised-button
              color="primary"
              type="submit"
              class="submit-button"
              [disabled]="registerForm.invalid || isLoading"
            >
              <mat-spinner diameter="20" *ngIf="isLoading" style="display: inline-block; margin-right: 8px;"></mat-spinner>
              <span>{{ isLoading ? 'Creating Account...' : 'Register' }}</span>
            </button>
          </form>
        </mat-card-content>

        <mat-card-footer *ngIf="!successMessage">
          <p class="login-prompt">
            Already have an account?
            <a routerLink="/login" class="link">Log in</a>
          </p>
        </mat-card-footer>
      </mat-card>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem 1rem;
    }
    .register-card {
      width: 100%;
      max-width: 520px;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }
    mat-card-header {
      margin-bottom: 1.5rem;
    }
    .form-row {
      display: flex;
      gap: 1rem;
    }
    .half-width {
      flex: 1;
    }
    .full-width {
      width: 100%;
      margin-bottom: 0.5rem;
    }
    .submit-button {
      width: 100%;
      padding: 0.75rem;
      margin-top: 1rem;
      font-size: 1rem;
      font-weight: 600;
    }
    .alert {
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }
    .alert-error {
      background-color: #fee2e2;
      color: #991b1b;
      border: 1px solid #fecaca;
    }
    .alert-success {
      background-color: #dcfce7;
      color: #166534;
      border: 1px solid #bbf7d0;
    }
    .login-prompt {
      text-align: center;
      padding: 1rem 0 0 0;
      color: #6b7280;
      font-size: 0.9rem;
    }
    .link {
      color: #1976d2;
      font-weight: 600;
      text-decoration: none;
    }
    .link:hover {
      text-decoration: underline;
    }
  `],
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  hidePassword = true;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  registerForm: FormGroup = this.fb.group({
    first_name: ['', [Validators.required, Validators.pattern(/^[^\s].*$/)]],
    last_name: ['', [Validators.required, Validators.pattern(/^[^\s].*$/)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = {
      first_name: this.registerForm.value.first_name.trim(),
      last_name: this.registerForm.value.last_name.trim(),
      email: this.registerForm.value.email.trim(),
      phone: this.registerForm.value.phone?.trim() || '',
      password: this.registerForm.value.password,
    };

    this.authService.register(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = 'Account created successfully! You can now log in.';
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 409) {
          this.errorMessage = 'This email address is already registered. Please try logging in instead.';
        } else if (err.error?.errors && Array.isArray(err.error.errors)) {
          this.errorMessage = err.error.errors.map((e: any) => e.msg).join(', ');
        } else if (err.error?.error) {
          this.errorMessage = err.error.error;
        } else {
          this.errorMessage = 'An error occurred during registration. Please try again.';
        }
      },
    });
  }
}
