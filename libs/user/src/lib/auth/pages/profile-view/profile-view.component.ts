import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { Observable } from 'rxjs';
import { Organization } from '@blockframes/organization/+state/organization.model';
import { TunnelService } from '@blockframes/ui/tunnel';
import { User } from '@blockframes/auth/+state/auth.store';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

const navLinks = [
  {
    path: 'settings',
    label: 'Profile Settings'
  },
  {
    path: 'cookies',
    label: 'Cookie Preferences'
  }
];

@Component({
  selector: 'auth-profile-view',
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileViewComponent implements OnInit {
  public organization$: Observable<Organization>;
  public previousPage: string;
  public navLinks = navLinks;
  public user$: Observable<User>;

  constructor(
    private authQuery: AuthQuery,
    private organizationQuery: OrganizationQuery,
    private tunnelService: TunnelService,
    private dynTitle: DynamicTitleService,
  ) {

    this.dynTitle.setPageTitle(`
    ${this.authQuery.getValue().profile.lastName}
    ${this.authQuery.getValue().profile.firstName}`,
      `${this.organizationQuery.getActive().denomination.full}`);
  }

  ngOnInit() {
    this.user$ = this.authQuery.user$;
    this.organization$ = this.organizationQuery.selectActive();
    this.previousPage = this.tunnelService.previousUrl || '../../..';
  }

}
