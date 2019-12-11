import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'catalog-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogFooterComponent {
  public emailControl: FormControl = new FormControl('', Validators.email);

  constructor(private breakpoint: BreakpointObserver, private snackbar: MatSnackBar) { }

  public registerEmailForNewsletter() {
    if (this.emailControl.valid) {
      // TODO #1366
      this.snackbar.open('Thanks for subscribing to the newsletter', 'close',
        { duration: 3000 })
    }
  }
}
