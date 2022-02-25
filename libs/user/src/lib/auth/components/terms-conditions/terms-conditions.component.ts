import { ChangeDetectionStrategy, Component } from '@angular/core';
import { applicationUrl } from '@blockframes/utils/apps';
import { Location } from '@angular/common';
import { AppGuard } from '@blockframes/utils/routes/app.guard';

@Component({
  selector: 'auth-terms-conditions',
  templateUrl: './terms-conditions.component.html',
  styleUrls: ['./terms-conditions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TermsConditionsComponent {
  app = this.appGuard.currentApp;
  appUrl = applicationUrl[this.app];
  canGoBack = window.history.length > 1;

  constructor(
    private appGuard: AppGuard,
    private location: Location,
  ) { }

  goBack() {
    this.location.back();
  }

}
