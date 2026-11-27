import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpTesting: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should attach Authorization header when token is available', () => {
    authServiceSpy.getToken.and.returnValue('sample-token-123');

    httpClient.get('/api/test').subscribe();

    const req = httpTesting.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBeTrue();
    expect(req.request.headers.get('Authorization')).toBe('Bearer sample-token-123');
    req.flush({});
  });

  it('should not attach Authorization header when token is null', () => {
    authServiceSpy.getToken.and.returnValue(null);

    httpClient.get('/api/test').subscribe();

    const req = httpTesting.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });
});
