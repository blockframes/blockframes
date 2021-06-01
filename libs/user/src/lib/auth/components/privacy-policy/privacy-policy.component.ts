import { ChangeDetectionStrategy, Component } from "@angular/core";
import { getCurrentApp } from "@blockframes/utils/apps";
import { RouterQuery } from "@datorama/akita-ng-router-store";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: 'auth-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PrivacyPolicyComponent {
  appName: string;
  constructor(private routerQuery: RouterQuery, private dialog: MatDialog) {
    this.appName = getCurrentApp(this.routerQuery);
  }

  goBack() {
    this.dialog.closeAll();
  }
}
