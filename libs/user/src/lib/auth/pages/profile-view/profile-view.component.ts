import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, Inject } from '@angular/core';
import { NavigationEnd, Router, Event } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';

// blockframes
import { Organization, User, App, canHavePreferences } from '@blockframes/model';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { OrganizationService } from '@blockframes/organization/service';
import { AuthService } from '../../service';
import { APP } from '@blockframes/utils/routes/utils';
import { NavigationService } from '@blockframes/ui/navigation.service';

const navLinks = [
  {
    path: 'settings',
    label: $localize`My Profile`
  },
  {
    path: 'notifications',
    label: $localize`Notifications`
  },
  {
    path: 'cookies',
    label: $localize`Cookies`
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

  private countRouteEvents = 0;
  private sub: Subscription;

  constructor(
    private dynTitle: DynamicTitleService,
    private orgService: OrganizationService,
    private navService: NavigationService,

    private authService: AuthService,
    @Inject(APP) private app: App,
    private router: Router
  ) {

    this.dynTitle.setPageTitle(`
    ${this.authService.profile.lastName}
    ${this.authService.profile.firstName}`,
      `${this.orgService.org.name}`);

    this.sub = this.router.events.pipe(
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
    if (canHavePreferences(org, this.app)) {
      this.navLinks.push({ path: 'preferences', label: 'Buying Preferences' })
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  goBack() {
    this.navService.goBack(this.countRouteEvents);
  }
}