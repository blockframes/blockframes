import { ChangeDetectionStrategy, Component, OnInit, Optional } from "@angular/core";
import { Location } from '@angular/common';
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { getCurrentApp, applicationUrl } from "@blockframes/utils/apps";
import { getAppLocation } from "@blockframes/utils/helpers";
import { RouterQuery } from "@datorama/akita-ng-router-store";
import { MatDialogRef } from "@angular/material/dialog";

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

  constructor(
    private routerQuery: RouterQuery,
    private location: Location,
    @Optional() private ref?: MatDialogRef<unknown>
  ) { }

  ngOnInit() {
    this.section$ = this.routerQuery.select('state').pipe(map(data => getAppLocation(data.url)));
    this.appName = getCurrentApp(this.routerQuery);
    this.appUrl = applicationUrl[this.appName];
  }

  goBack() {
    if (this.ref) {
      this.ref.close();
    } else {
      this.location.back();
    }
  }
}
