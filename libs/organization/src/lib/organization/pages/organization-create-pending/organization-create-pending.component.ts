import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { getCurrentApp, appName } from '@blockframes/utils/apps';
import { OrganizationQuery } from '@blockframes/organization/+state';

@Component({
  selector: 'organization-create-pending',
  templateUrl: './organization-create-pending.component.html',
  styleUrls: ['./organization-create-pending.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationCreatePendingComponent {
  public app = getCurrentApp(this.routerQuery);
  public appName = appName[this.app];
  public org = this.query.getActive();

  constructor(private query: OrganizationQuery, private routerQuery: RouterQuery) { }

}
