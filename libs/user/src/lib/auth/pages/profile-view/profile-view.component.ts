import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { Observable } from 'rxjs';
import { Organization } from '@blockframes/organization/+state/organization.model';
import { TunnelService } from '@blockframes/ui/tunnel';
import { User } from '@blockframes/auth/+state/auth.store';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { App, getCurrentApp } from '@blockframes/utils/apps';
import { RouterQuery } from '@datorama/akita-ng-router-store';

const navLinks = [
  {
    path: 'settings',
    label: 'Profile'
  },
  {
    path: 'notifications',
    label: 'Notifications'
  },
  {
    path: 'cookies',
    label: 'Cookies'
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
  public navLinks = navLinks;
  public user$: Observable<User>;

  constructor(
    private authQuery: AuthQuery,
    private organizationQuery: OrganizationQuery,
    public tunnelService: TunnelService,
    private dynTitle: DynamicTitleService,
    private routerQuery: RouterQuery
  ) {

    this.dynTitle.setPageTitle(`
    ${this.authQuery.getValue().profile.lastName}
    ${this.authQuery.getValue().profile.firstName}`,
      `${this.organizationQuery.getActive().denomination.full}`);
  }

  ngOnInit() {
    this.user$ = this.authQuery.user$;
    this.organization$ = this.organizationQuery.selectActive();

    this.organization$.subscribe(org => {
      if (!this.navLinks.some(link => link.path === 'preferences')) {
        const app = getCurrentApp(this.routerQuery);
        const appsWithPreferences: App[] = ['catalog', 'festival'];
  
        if (appsWithPreferences.includes(app) && org.appAccess[app].marketplace && !org.appAccess[app].dashboard) {
          this.navLinks.push({
            path: 'preferences',
            label: 'Buyer Preferences'
          })
        }
      }
    })
  }

}
