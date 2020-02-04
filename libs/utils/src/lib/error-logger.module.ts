/**
 * At some point our frontend started capturing errors and made them impossible to
 * detect at dev time (we had to use sentry on our dev machine to see errors).
 *
 * This ErrorLoggerHandler is a hack to make sure we are actually logging the error.
 */
import { ErrorHandler, Injectable, NgModule } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Injectable()
export class ErrorLoggerHandler implements ErrorHandler {
  constructor(private snackBar: MatSnackBar) {}

  handleError(error) {
    console.error(error);
    this.snackBar.open(`${error}`.substring(0, 100));
  }
}

@NgModule({
  imports: [MatSnackBarModule],
  providers: [
    {
      provide: ErrorHandler,
      useClass: ErrorLoggerHandler
    }
  ]
})
export class ErrorLoggerModule {}
