import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { getCurrentApp, applicationUrl } from "@blockframes/utils/apps";
import { getAppLocation } from "@blockframes/utils/helpers";
import { RouterQuery } from "@datorama/akita-ng-router-store";
import { Location } from '@angular/common';

@Component({
  selector: 'auth-terms-conditions',
  templateUrl: './terms-conditions.component.html',
  styleUrls: ['./terms-conditions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TermsConditionsComponent implements OnInit {
  section$: Observable<'dashboard' | 'marketplace'>;
  appUrl: string;
  appName: string;
  canGoBack = window.history.length > 1;

  constructor(
    private routerQuery: RouterQuery,
    private location: Location,
  ) { }

  ngOnInit() {
    this.section$ = this.routerQuery.select('state').pipe(map(data => getAppLocation(data.url)));
    this.appName = getCurrentApp(this.routerQuery);
    this.appUrl = applicationUrl[this.appName];
  }

  goBack() {
    this.location.back();
  }

}
