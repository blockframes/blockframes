import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { NavigationEnd, Router, Event } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';

// blockframes
import { Organization } from '@blockframes/organization/+state/organization.model';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
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

  private countRouteEvents = 1;
  private subs: Subscription[] = [];

  constructor(
    private query: OrganizationQuery,
    private authQuery: AuthQuery,
    private dynTitle: DynamicTitleService,
    private routerQuery: RouterQuery,
    private location: Location,
    private router: Router,
  ) {
    const sub = this.routerQuery.select('state').subscribe(data => {
      if (data.url.includes('members')) {
        this.dynTitle.setPageTitle('Members', `${this.query.getActive().denomination.full}`);
      } else if (data.url.includes('documents')) {
        this.dynTitle.setPageTitle('Documents', `${this.query.getActive().denomination.full}`);
      } else {
        this.dynTitle.setPageTitle('Company details', `${this.query.getActive().denomination.full}`);
      }
    })
    this.subs.push(sub);
  }

  ngOnInit() {
    this.user$ = this.authQuery.user$;
    this.organization$ = this.query.selectActive();

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
