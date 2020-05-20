import { ChangeDetectionStrategy, Component } from '@angular/core';
import { OrganizationQuery, OrganizationService } from '@blockframes/organization/+state';
import { map, switchMap } from 'rxjs/operators';
import { getCurrentApp } from '@blockframes/utils/apps';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { slideDown } from '@blockframes/utils/animations/fade';
import { AuthQuery } from '@blockframes/auth/+state';

@Component({
  selector: 'organization-create-feedback',
  templateUrl: './organization-create-feedback.component.html',
  styleUrls: ['./organization-create-feedback.component.scss'],
  animations: [slideDown],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationCreateFeedbackComponent {
  public organization = this.query.getActive();
  public app = getCurrentApp(this.routerQuery);
  public isAccepted$ = this.authQuery.select().pipe(
    switchMap(user => this.service.valueChanges(user.orgId)),
    map(organization => organization[0].status === 'accepted')
  )

  constructor(
    private query: OrganizationQuery,
    private service: OrganizationService,
    private authQuery: AuthQuery,
    private routerQuery: RouterQuery
  ) {}
}
