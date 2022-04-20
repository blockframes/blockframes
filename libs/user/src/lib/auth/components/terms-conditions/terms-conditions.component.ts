import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { App, applicationUrl } from '@blockframes/utils/apps';
import { Location } from '@angular/common';
import { APP } from '@blockframes/utils/routes/utils';
import { supportEmails } from '@env'

@Component({
  selector: 'auth-terms-conditions',
  templateUrl: './terms-conditions.component.html',
  styleUrls: ['./terms-conditions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TermsConditionsComponent {
  appUrl = applicationUrl[this.app];
  canGoBack = window.history.length > 1;
  supportEmail = supportEmails.default;

  constructor(
    private location: Location,
    @Inject(APP) public app: App,
  ) { }

  goBack() {
    this.location.back();
  }

}
