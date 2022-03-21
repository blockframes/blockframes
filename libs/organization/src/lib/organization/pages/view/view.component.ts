import { Component, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { NavigationEnd, Router, Event } from '@angular/router';
import { Location } from '@angular/common';
import { distinctUntilChanged, filter } from 'rxjs/operators';

// Blockframes
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { OrganizationService } from '@blockframes/organization/+state';

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
export class OrganizationViewComponent implements OnDestroy {
  public organization$ = this.orgService.currentOrg$;
  public navLinks = navLinks;

  private countRouteEvents = 0;
  private sub = this.router.events.pipe(
    filter((evt: Event) => evt instanceof NavigationEnd),
    distinctUntilChanged((a: NavigationEnd, b: NavigationEnd) => a.url === b.url),
  ).subscribe((event: NavigationEnd) => {
    if (event.url.includes('members')) {
      this.dynTitle.setPageTitle('Members', `${this.orgService.org.denomination.full}`);
    } else {
      this.dynTitle.setPageTitle('Company details', `${this.orgService.org.denomination.full}`);
    }

    this.countRouteEvents++;
  });

  constructor(
    private orgService: OrganizationService,
    private dynTitle: DynamicTitleService,
    private location: Location,
    private router: Router
  ) { }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  goBack() {
    const state = this.location.getState() as { navigationId: number };
    if (state?.navigationId === 1) {
      this.router.navigate(['/c/o']);
    } else {
      this.location.historyGo(-this.countRouteEvents);
    }
  }
}
