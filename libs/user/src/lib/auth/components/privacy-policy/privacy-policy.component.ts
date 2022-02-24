import { ChangeDetectionStrategy, Component } from "@angular/core";
import { Location } from '@angular/common';
import { getCurrentApp } from "@blockframes/utils/apps";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: 'auth-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PrivacyPolicyComponent {
  appName = getCurrentApp(this.route);
  canGoBack = window.history.length > 1;
  constructor(
    private location: Location,
    private route: ActivatedRoute
  ) { }

  goBack() {
    this.location.back();
  }
}
