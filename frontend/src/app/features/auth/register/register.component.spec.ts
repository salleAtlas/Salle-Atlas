import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../core/services/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['register']);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the register component', () => {
    expect(component).toBeTruthy();
  });

  it('should have an invalid form initially', () => {
    expect(component.registerForm.valid).toBeFalse();
  });

  it('should validate email format and password length >= 8', () => {
    const emailControl = component.registerForm.get('email');
    const passwordControl = component.registerForm.get('password');

    emailControl?.setValue('invalid-email');
    expect(emailControl?.valid).toBeFalse();

    emailControl?.setValue('valid@example.com');
    expect(emailControl?.valid).toBeTrue();

    passwordControl?.setValue('123');
    expect(passwordControl?.valid).toBeFalse();

    passwordControl?.setValue('12345678');
    expect(passwordControl?.valid).toBeTrue();
  });

  it('should call AuthService.register on valid form submission', () => {
    component.registerForm.setValue({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      password: 'password123',
    });

    mockAuthService.register.and.returnValue(
      of({
        message: 'Client registered successfully',
        client: {
          _id: '1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
        },
      })
    );

    component.onSubmit();

    expect(mockAuthService.register).toHaveBeenCalled();
    expect(component.successMessage).toContain('Account created successfully');
    expect(component.errorMessage).toBe('');
  });

  it('should display error message on 409 conflict', () => {
    component.registerForm.setValue({
      first_name: 'John',
      last_name: 'Doe',
      email: 'existing@example.com',
      phone: '',
      password: 'password123',
    });

    mockAuthService.register.and.returnValue(
      throwError(() => ({ status: 409, error: { error: 'Email already registered' } }))
    );

    component.onSubmit();

    expect(component.errorMessage).toContain('already registered');
    expect(component.successMessage).toBe('');
  });
});
