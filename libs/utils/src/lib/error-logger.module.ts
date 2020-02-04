/**
 * At some point our frontend started capturing errors and made them impossible to
 * detect at dev time (we had to use sentry on our dev machine to see errors).
 *
 * This ErrorLoggerHandler is a hack to make sure we are actually logging the error.
 */
import { ErrorHandler, Injectable, NgModule } from '@angular/core';

@Injectable()
export class ErrorLoggerHandler implements ErrorHandler {
  handleError(error) {
    console.error(error);
  }
}

@NgModule({
  providers: [
    {
      provide: ErrorHandler,
      useClass: ErrorLoggerHandler
    }
  ]
})
export class ErrorLoggerModule {}
