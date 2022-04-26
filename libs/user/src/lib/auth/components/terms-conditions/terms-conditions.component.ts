import { AfterViewInit, ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { App, applicationUrl } from '@blockframes/utils/apps';
import { Location } from '@angular/common';
import { APP } from '@blockframes/utils/routes/utils';
import { supportEmails } from '@env'
import { ActivatedRoute } from '@angular/router';

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
