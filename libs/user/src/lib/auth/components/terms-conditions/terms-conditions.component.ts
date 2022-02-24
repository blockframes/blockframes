import { ChangeDetectionStrategy, Component } from '@angular/core';
import { getCurrentApp, applicationUrl } from '@blockframes/utils/apps';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'auth-terms-conditions',
  templateUrl: './terms-conditions.component.html',
  styleUrls: ['./terms-conditions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TermsConditionsComponent {
  app = getCurrentApp(this.route);
  appUrl = applicationUrl[this.app];
  canGoBack = window.history.length > 1;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
  ) { }

  goBack() {
    this.location.back();
  }

}
