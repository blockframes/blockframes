import { AfterViewInit, ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { applicationUrl } from '@blockframes/utils/apps';
import { Location } from '@angular/common';
import { APP } from '@blockframes/utils/routes/utils';
import { supportEmails } from '@env';
import { ActivatedRoute } from '@angular/router';
import { App, preferredLanguage } from '@blockframes/model';

@Component({
  selector: 'auth-terms-conditions',
  templateUrl: './terms-conditions.component.html',
  styleUrls: ['./terms-conditions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TermsConditionsComponent implements AfterViewInit {
  appUrl = applicationUrl[this.app];
  canGoBack = window.history.length > 1;
  supportEmail = supportEmails.default;

  /** @dev i18n is only on waterfall app for now #9699 */
  public appLang = this.app === 'waterfall' ? preferredLanguage() : 'en';

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    @Inject(APP) public app: App,
  ) { }

  ngAfterViewInit(): void {
    this.route.fragment.subscribe(fragment => {
      if (fragment) document.getElementById(fragment).scrollIntoView();
    })
  }

  goBack() {
    this.location.back();
  }

}
