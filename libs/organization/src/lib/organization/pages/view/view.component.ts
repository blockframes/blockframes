import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { NavigationEnd, Router, Event } from '@angular/router';
import { Location } from '@angular/common';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';

// blockframes
import { Organization } from '@blockframes/organization/+state/organization.model';
import { OrganizationForm } from '@blockframes/organization/forms/organization.form';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { OrganizationService } from '@blockframes/organization/+state';
import { AuthService } from '@blockframes/auth/+state';
import { User } from '@blockframes/user/+state/user.model';

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

  private countRouteEvents = 1;
  private subs: Subscription[] = [];

  constructor(
    private orgService: OrganizationService,
    private authService: AuthService,
    private dynTitle: DynamicTitleService,
    private location: Location,
    private routerQuery: RouterQuery,
    private router: Router
  ) {
    const routerQuerySub = this.routerQuery.select('state').subscribe(data => {
      if (data.url.includes('members')) {
        this.dynTitle.setPageTitle('Members', `${this.orgService.org.denomination.full}`);
      } else if (data.url.includes('documents')) {
        this.dynTitle.setPageTitle('Documents', `${this.orgService.org.denomination.full}`);
      } else {
        this.dynTitle.setPageTitle('Company details', `${this.orgService.org.denomination.full}`);
      }
    })
    this.subs.push(routerQuerySub);

    const routerSub = this.router.events.pipe(
      filter((evt: Event) => evt instanceof NavigationEnd),
      distinctUntilChanged((a: NavigationEnd, b: NavigationEnd) => a.url === b.url),
    ).subscribe(() => this.countRouteEvents++);
    this.subs.push(routerSub);
  }

  ngOnInit() {
    this.user$ = this.authService.profile$;
    this.organization$ = this.orgService.currentOrg$;

    const sub = this.router.events.pipe(
      filter((evt: Event) => evt instanceof NavigationEnd),
      distinctUntilChanged((a: NavigationEnd, b: NavigationEnd) => a.url === b.url),
    ).subscribe(() => this.countRouteEvents++);
    this.subs.push(sub)
  }

  ngOnDestroy() {
    for (const sub of this.subs) {
      sub.unsubscribe();
    }
  }

  goBack() {
    this.location.historyGo(-this.countRouteEvents);
  }
}
