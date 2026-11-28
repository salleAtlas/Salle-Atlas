import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService, RegisterRequest, LoginRequest } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('register should send POST to /api/auth/register', () => {
    const mockRequest: RegisterRequest = {
      first_name: 'Alice',
      last_name: 'Wonder',
      email: 'alice@example.com',
      password: 'password123',
    };

    const mockResponse = {
      message: 'Client registered successfully',
      client: {
        _id: '123',
        first_name: 'Alice',
        last_name: 'Wonder',
        email: 'alice@example.com',
      },
    };

    service.register(mockRequest).subscribe((res) => {
      expect(res.message).toBe('Client registered successfully');
      expect(res.client.email).toBe('alice@example.com');
    });

    const req = httpTesting.expectOne(`${environment.apiUrl}/auth/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockRequest);
    req.flush(mockResponse);
  });

  it('login should send POST to /api/auth/login and store session token', () => {
    const credentials: LoginRequest = {
      email: 'alice@example.com',
      password: 'password123',
    };

    const mockResponse = {
      message: 'Login successful',
      token: 'jwt.sample.token',
      client: {
        _id: '123',
        first_name: 'Alice',
        last_name: 'Wonder',
        email: 'alice@example.com',
      },
    };

    service.login(credentials).subscribe((res) => {
      expect(res.token).toBe('jwt.sample.token');
      expect(service.getToken()).toBe('jwt.sample.token');
      expect(service.isAuthenticated()).toBeTrue();
      expect(service.currentUser()?.first_name).toBe('Alice');
    });

    const req = httpTesting.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(credentials);
    req.flush(mockResponse);
  });

  it('logout should clear token, reset currentUser, and navigate to /login', () => {
    localStorage.setItem('auth_token', 'sample.token');
    service.token.set('sample.token');

    service.logout();

    expect(service.getToken()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.currentUser()).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
