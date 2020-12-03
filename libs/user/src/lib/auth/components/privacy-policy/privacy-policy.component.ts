import { ChangeDetectionStrategy, Component } from "@angular/core";
import { Location } from "@angular/common";
import { getCurrentApp } from "@blockframes/utils/apps";
import { RouterQuery } from "@datorama/akita-ng-router-store";

@Component({
  selector: 'auth-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacyPolicyComponent {
  appName: string;
  constructor(private location: Location, private routerQuery: RouterQuery) {
    this.appName = getCurrentApp(this.routerQuery);;
  }

  goBack() {
    this.location.back();
  }
}
