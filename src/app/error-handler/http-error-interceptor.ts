import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {ErrorMessageService} from './error-message.service';
import { Observable } from 'rxjs/internal/Observable';
import { tap } from 'rxjs/operators';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

  constructor(private errorMessageService: ErrorMessageService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(request).pipe(
      tap(
      () => {},
      (error: any) => {
        if (error instanceof HttpErrorResponse) {
          console.log('HTTP Error Interceptor: ' + this.extractErrorMessage(error));
          if (error.status !== 404) {
            const errorMessage = this.extractErrorMessage(error);
            if (errorMessage) {
              this.errorMessageService.showErrorMessage(this.extractErrorMessage(error));
            }
          }
        }
      })
    );
  }

  private extractErrorMessage(error: HttpErrorResponse): string {
    if (error.error) {
      if (error.error.errors) {
        return error.error.errors.map(e => e.entity + ' ' + e.property + ': ' + e.message).join(', ');
      }
      if (error.error.cause || error.error.message) {
        let cause = error.error;
        while (cause.cause) {
          cause = cause.cause;
        }
        return cause.message.split('?')[0];
      }
      if (typeof error.error.error === 'string') {
        return error.error.error;
      }
    }
    if (error.message) {
      return error.message;
    }
    return error.name;
  }
}
