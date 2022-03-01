import { ChangeDetectionStrategy, Component, Inject } from "@angular/core";
import { Location } from '@angular/common';
import { App } from "@blockframes/utils/apps";
import { APP } from '@blockframes/utils/routes/utils';

@Component({
  selector: 'auth-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PrivacyPolicyComponent {
  canGoBack = window.history.length > 1;
  constructor(
    private location: Location,
    @Inject(APP) public app: App,
  ) { }

  goBack() {
    this.location.back();
  }
}
