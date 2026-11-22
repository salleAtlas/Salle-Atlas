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
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
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
      next: () => {
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
