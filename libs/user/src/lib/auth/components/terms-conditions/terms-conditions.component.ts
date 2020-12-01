import { ChangeDetectionStrategy, Component } from "@angular/core";
import { Location } from "@angular/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { getCurrentApp, applicationUrl } from "@blockframes/utils/apps";
import { getAppLocation } from "@blockframes/utils/helpers";
import { RouterQuery } from "@datorama/akita-ng-router-store";

@Component({
  selector: 'auth-terms-conditions',
  templateUrl: './terms-conditions.component.html',
  styleUrls: ['./terms-conditions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TermsConditionsComponent {
  section$: Observable<'dashboard' | 'marketplace'>;
  appUrl: string;

  constructor(
    private location: Location,
    private routerQuery: RouterQuery,
  ) {
    this.section$ = this.routerQuery.select('state').pipe(map(data => getAppLocation(data.url)));
    const app = getCurrentApp(this.routerQuery);
    this.appUrl = applicationUrl[app];
  }

  goBack() {
    this.location.back();
  }
}
