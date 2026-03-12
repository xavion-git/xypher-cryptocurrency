import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let message = 'An unexpected error occurred';

        if (error.status === 0) {
          message = 'Cannot connect to Xypher node. Make sure the backend is running on port 3001.';
        } else if (error.status === 400) {
          message = error.error || 'Bad request';
        } else if (error.status === 404) {
          message = 'Not found';
        } else if (error.status >= 500) {
          message = 'Server error. Check the backend logs.';
        }

        console.error(`[Xypher API Error] ${error.status}: ${message}`);
        return throwError(() => ({ status: error.status, message }));
      })
    );
  }
}
