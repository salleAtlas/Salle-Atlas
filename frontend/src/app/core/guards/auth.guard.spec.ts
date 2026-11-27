import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = { url: '/protected' } as RouterStateSnapshot;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
      ],
    });

    router = TestBed.inject(Router);
  });

  it('should allow access if user is authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

    expect(result).toBeTrue();
  });

  it('should redirect to /login with returnUrl if user is not authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);

    const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState)) as UrlTree;

    expect(result instanceof UrlTree).toBeTrue();
    expect(result.toString()).toContain('/login');
    expect(result.queryParams['returnUrl']).toBe('/protected');
  });
});
