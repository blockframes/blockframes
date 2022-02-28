import { ChangeDetectionStrategy, Component } from "@angular/core";
import { Location } from '@angular/common';
import { AppGuard } from '@blockframes/utils/routes/app.guard';

@Component({
  selector: 'auth-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PrivacyPolicyComponent {
  appName = this.appGuard.currentApp;
  canGoBack = window.history.length > 1;
  constructor(
    private location: Location,
    private appGuard: AppGuard,
  ) { }

  goBack() {
    this.location.back();
  }
}
