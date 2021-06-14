import { ChangeDetectionStrategy, Component } from "@angular/core";
import { getCurrentApp } from "@blockframes/utils/apps";
import { RouterQuery } from "@datorama/akita-ng-router-store";

@Component({
  selector: 'auth-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PrivacyPolicyComponent {
  appName = getCurrentApp(this.routerQuery);
  canGoBack = window.history.length > 1;
  constructor(
    private routerQuery: RouterQuery,
  ) { }





}
