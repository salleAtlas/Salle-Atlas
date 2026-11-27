import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthService, RegisterRequest } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
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
});
