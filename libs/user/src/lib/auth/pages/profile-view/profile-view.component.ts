import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Location } from '@angular/common'
import { NavigationEnd, Router, Event } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';

// blockframes
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { Organization } from '@blockframes/organization/+state/organization.model';
import { User } from '@blockframes/auth/+state/auth.store';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { getCurrentApp } from '@blockframes/utils/apps';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { canHavePreferences } from '@blockframes/user/+state/user.utils';

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
export class ProfileViewComponent implements OnInit, OnDestroy {
  public organization$: Observable<Organization>;
  public navLinks = navLinks;
  public user$: Observable<User>;

  private countRouteEvents = 1;
  private sub: Subscription;

  constructor(
    private authQuery: AuthQuery,
    private organizationQuery: OrganizationQuery,
    private dynTitle: DynamicTitleService,
    private location: Location,
    private router: Router,
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

    const hasPreferences = this.navLinks.some(link => link.path === 'preferences');
    if (hasPreferences) return;

    const org = this.organizationQuery.getActive();
    const app = getCurrentApp(this.routerQuery);
    if (canHavePreferences(org, app)) {
      this.navLinks.push({ path: 'preferences', label: 'Buying Preferences' })
    }

    this.sub = this.router.events.pipe(
      filter((evt: Event) => evt instanceof NavigationEnd),
      distinctUntilChanged((a: NavigationEnd, b: NavigationEnd) => a.url === b.url),
    ).subscribe(() => this.countRouteEvents++);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  goBack() {
    this.location.historyGo(-this.countRouteEvents);
  }
}