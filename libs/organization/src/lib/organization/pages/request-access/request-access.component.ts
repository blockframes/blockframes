import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { getCurrentApp, appName } from '@blockframes/utils/apps';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrganizationQuery, OrganizationService } from '@blockframes/organization/+state';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'org-request-access',
  templateUrl: './request-access.component.html',
  styleUrls: ['./request-access.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrgRequestAccessComponent implements OnInit {
  private app = getCurrentApp(this.routerQuery);
  public appName = appName[this.app];
  public org$ = this.orgQuery.selectActive();
  public orgId = this.orgQuery.getActiveId();
  public orgHasAccess$: Observable<boolean>;

  constructor(
    private routerQuery: RouterQuery,
    private snackBar: MatSnackBar,
    private orgService: OrganizationService,
    private orgQuery: OrganizationQuery
  ) {}

  ngOnInit() {
    this.orgHasAccess$ = this.org$.pipe(
      map(org => (org.appAccess[this.app].dashboard || org.appAccess[this.app].marketplace))
    )
  }

  async requestAccess() {
    await this.orgService.requestToAccessToApp(this.app, this.orgId);
    this.snackBar.open('Your request to access to this platform has been sent.', 'close', { duration: 5000 });
  }
}
