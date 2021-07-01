import { ChangeDetectionStrategy, Component } from "@angular/core";
import { Location } from '@angular/common';
import { getCurrentApp } from "@blockframes/utils/apps";
import { RouterQuery } from "@datorama/akita-ng-router-store";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: 'auth-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PrivacyPolicyComponent {
  appName = getCurrentApp(this.routerQuery);
  canGoBack = this.route.snapshot.queryParamMap.get('no_back') !== 'true';
  constructor(
    private routerQuery: RouterQuery,
    private location: Location,
    private route: ActivatedRoute,
  ) { }

  goBack() {
    this.location.back();
  }
}
