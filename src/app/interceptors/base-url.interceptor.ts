import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const baseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const base: string = environment.apiUrl;
  const isAbsoluteUrl = req.url.startsWith('http');
  const newUrl = isAbsoluteUrl ? req.url : `${base}/${req.url.replace(/^\//, '')}`;

  const clonedRequest = req.clone({
    url: newUrl,
    setHeaders: {
      Accept: 'application/json',
    },
  });

  return next(clonedRequest);
};
