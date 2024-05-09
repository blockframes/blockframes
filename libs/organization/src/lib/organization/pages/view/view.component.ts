import { Component, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { NavigationEnd, Router, Event } from '@angular/router';
import { distinctUntilChanged, filter } from 'rxjs/operators';

// Blockframes
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { OrganizationService } from '@blockframes/organization/service';
import { NavigationService } from '@blockframes/ui/navigation.service';

const navLinks = [
  {
    path: 'org',
    label: $localize`Organization`
  },
  {
    path: 'members',
    label: $localize`Members`
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
      this.dynTitle.setPageTitle($localize`Members`, `${this.orgService.org.name}`);
    } else {
      this.dynTitle.setPageTitle($localize`Company details`, `${this.orgService.org.name}`);
    }

    this.countRouteEvents++;
  });

  constructor(
    private orgService: OrganizationService,
    private navService: NavigationService,
    private dynTitle: DynamicTitleService,
    private router: Router
  ) { }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  goBack() {
    this.navService.goBack(this.countRouteEvents);
  }
}
