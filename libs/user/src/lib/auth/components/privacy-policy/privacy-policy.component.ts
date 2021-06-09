import { ChangeDetectionStrategy, Component, Optional } from "@angular/core";
import { Location } from '@angular/common';
import { getCurrentApp } from "@blockframes/utils/apps";
import { RouterQuery } from "@datorama/akita-ng-router-store";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: 'auth-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PrivacyPolicyComponent {
  appName = getCurrentApp(this.routerQuery);
  constructor(
    private routerQuery: RouterQuery,
    private location: Location,
    @Optional() private ref?: MatDialogRef<unknown>
  ) {}

  goBack() {
    if (this.ref) {
      this.ref.close();
    } else {
      this.location.back();
    }
  }
}
