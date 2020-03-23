import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { Organization } from '@blockframes/organization/+state/organization.model';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { TunnelService } from '@blockframes/ui/tunnel/tunnel.service';
import { OrganizationForm } from '@blockframes/organization/forms/organization.form';
import { User } from '@blockframes/auth/+state/auth.store';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { Title } from '@angular/platform-browser';
import { RouterQuery } from '@datorama/akita-ng-router-store';

const navLinks = [{
  path: 'org',
  label: 'Organization'
}, {
  path: 'members',
  label: 'Members'
}];

@Component({
  selector: 'organization-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationViewComponent implements OnInit {
  public organization$: Observable<Organization>;
  public previousPage: string;
  public navLinks = navLinks;
  public organizationForm = new OrganizationForm();
  public user$: Observable<User>;

  constructor(
    private query: OrganizationQuery,
    private tunnelService: TunnelService,
    private authQuery: AuthQuery,
    private title: Title,
    private routerQuery: RouterQuery
  ) {
    this.refreshTitle()
  }

  ngOnInit() {
    this.user$ = this.authQuery.user$;
    this.organization$ = this.query.selectActive();
    this.previousPage = this.tunnelService.previousUrl || '../../..';
  }

  public refreshTitle(link?: string) {
    if (link) {
      switch (link) {
        case 'members':
          this.title.setTitle(`Members - ${this.query.getActive().name} - Blockframes`);
          break;
        case 'org':
          this.title.setTitle(`Company details - ${this.query.getActive().name} - Blockframes`);
          break;
      }
    } else {
      this.routerQuery.getValue().state.url.includes('org')
        ? this.title.setTitle(`Company details - ${this.query.getActive().name} - Blockframes`)
        : this.title.setTitle(`Members - ${this.query.getActive().name} - Blockframes`);
    }
  }
}
