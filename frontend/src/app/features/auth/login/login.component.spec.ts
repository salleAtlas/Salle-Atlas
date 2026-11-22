import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.returnValue(Promise.resolve(true));

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form when empty', () => {
    expect(component.loginForm.valid).toBeFalse();
  });

  it('should validate email format', () => {
    const email = component.loginForm.get('email');
    email?.setValue('invalid-email');
    expect(email?.hasError('email')).toBeTrue();

    email?.setValue('valid@example.com');
    expect(email?.hasError('email')).toBeFalse();
  });

  it('should call authService.login and navigate on successful submission', () => {
    component.loginForm.setValue({
      email: 'user@example.com',
      password: 'password123',
    });

    authServiceSpy.login.and.returnValue(
      of({
        message: 'Login successful',
        token: 'fake-jwt-token',
        client: {
          _id: '123',
          first_name: 'John',
          last_name: 'Doe',
          email: 'user@example.com',
        },
      })
    );

    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/search');
    expect(component.isLoading).toBeFalse();
  });

  it('should display error message on failed login', () => {
    component.loginForm.setValue({
      email: 'user@example.com',
      password: 'wrongpassword',
    });

    authServiceSpy.login.and.returnValue(
      throwError(() => ({
        error: { error: 'Invalid email or password' },
      }))
    );

    component.onSubmit();

    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBe('Invalid email or password');
  });
});
