import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Completed in US A2 (attach Bearer JWT token)
  return next(req);
};
