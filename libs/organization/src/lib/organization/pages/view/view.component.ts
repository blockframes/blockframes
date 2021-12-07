import { Subscription } from 'rxjs';
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { Organization } from '@blockframes/organization/+state/organization.model';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { TunnelService } from '@blockframes/ui/tunnel/tunnel.service';
import { OrganizationForm } from '@blockframes/organization/forms/organization.form';
import { User } from '@blockframes/auth/+state/auth.store';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

const navLinks = [
  {
    path: 'org',
    label: 'Organization'
  },
  {
    path: 'members',
    label: 'Members'
  }
];

@Component({
  selector: 'organization-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationViewComponent implements OnInit, OnDestroy {
  public organization$: Observable<Organization>;
  public navLinks = navLinks;
  public organizationForm = new OrganizationForm();
  public user$: Observable<User>;
  private sub: Subscription;

  constructor(
    private query: OrganizationQuery,
    public tunnelService: TunnelService,
    private authQuery: AuthQuery,
    private dynTitle: DynamicTitleService,
    private routerQuery: RouterQuery
  ) {
    this.sub = this.routerQuery.select('state').subscribe(data => {
      if (data.url.includes('members')) {
        this.dynTitle.setPageTitle('Members', `${this.query.getActive().denomination.full}`);
      } else if (data.url.includes('documents')) {
        this.dynTitle.setPageTitle('Documents', `${this.query.getActive().denomination.full}`);
      } else {
        this.dynTitle.setPageTitle('Company details', `${this.query.getActive().denomination.full}`);
      }
    })
  }

  ngOnInit() {
    this.user$ = this.authQuery.user$;
    this.organization$ = this.query.selectActive();
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe()
  }
}
