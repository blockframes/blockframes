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
  constructor(private snackBar: MatSnackBar) { }

  handleError(error: Error | string) {
    if (this.snackBar._openedSnackBarRef === null) {
      if (error instanceof Error && error.message === 'LinearAnimationInstance instance already deleted') {
        // #9450 https://github.com/dappsnation/ng-rive/issues/46
        console.warn(`ng-rive : ${error.message}`);
      } else {
        console.error(error);
        this.snackBar.open(`${error}`.substring(0, 100), 'close');
      }
    }
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
export class ErrorLoggerModule { }
