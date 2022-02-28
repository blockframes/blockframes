import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { NavigationEnd, Router, Event } from '@angular/router';
import { Location } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';

// blockframes
import { Organization } from '@blockframes/organization/+state/organization.model';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { canHavePreferences } from '@blockframes/user/+state/user.utils';
import { OrganizationService } from '@blockframes/organization/+state';
import { AuthService } from '@blockframes/auth/+state';
import { User } from '@blockframes/user/+state/user.model';
import { AppGuard } from '@blockframes/utils/routes/app.guard';

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
    private dynTitle: DynamicTitleService,
    private location: Location,
    private orgService: OrganizationService,
    private authService: AuthService,
    private appGuard: AppGuard,
    router: Router
  ) {

    this.dynTitle.setPageTitle(`
    ${this.authService.profile.lastName}
    ${this.authService.profile.firstName}`,
      `${this.orgService.org.denomination.full}`);

    this.sub = router.events.pipe(
      filter((evt: Event) => evt instanceof NavigationEnd),
      distinctUntilChanged((a: NavigationEnd, b: NavigationEnd) => a.url === b.url),
    ).subscribe(() => this.countRouteEvents++);
  }

  ngOnInit() {
    this.user$ = this.authService.profile$;
    this.organization$ = this.orgService.currentOrg$;

    const hasPreferences = this.navLinks.some(link => link.path === 'preferences');
    if (hasPreferences) return;

    const org = this.orgService.org;
    const app = this.appGuard.currentApp;
    if (canHavePreferences(org, app)) {
      this.navLinks.push({ path: 'preferences', label: 'Buying Preferences' })
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  goBack() {
    this.location.historyGo(-this.countRouteEvents);
  }
}