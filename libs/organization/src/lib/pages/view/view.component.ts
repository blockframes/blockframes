import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { Organization } from '@blockframes/organization/+state/organization.model';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { TunnelService } from '@blockframes/ui/tunnel/tunnel.service';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { OrganizationForm } from '@blockframes/organization/forms/organization.form';
import { User } from '@blockframes/auth/+state/auth.store';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';

const   navLinks = [{
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
  public organizationForm = new OrganizationForm(this.service);
  public user$: Observable<User>;

  constructor(
    private query: OrganizationQuery,
    private tunnelService: TunnelService,
    private service: OrganizationService,
    private authQuery: AuthQuery
  ) { }

  ngOnInit() {
    this.user$ = this.authQuery.user$;
    this.organization$ = this.query.selectActive();
    this.previousPage = this.tunnelService.previousUrl;
  }
}
