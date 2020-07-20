// Angular
import { FormControl } from '@angular/forms';
import {
  Component,
  ChangeDetectionStrategy,
  AfterViewInit,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { MatSidenavContent } from '@angular/material/sidenav';
import { Router, NavigationEnd } from '@angular/router';

import { BreakpointsService } from '@blockframes/utils/breakpoint/breakpoints.service';
import { algolia } from '@env';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { InvitationQuery } from '@blockframes/invitation/+state/invitation.query';
import { NotificationQuery } from '@blockframes/notification/+state/notification.query';

@Component({
  selector: 'catalog-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutComponent implements AfterViewInit, OnDestroy {
  public invitationCount$ = this.invitationQuery.selectCount(
    invitation => invitation.status === 'pending'
  );
  public notificationCount$ = this.notificationQuery.selectCount();

  searchCtrl: FormControl = new FormControl('');

  ltMd$ = this.breakpointsService.ltMd;

  public movieIndex = algolia.indexNameMovies;

  private routerSub: Subscription;

  @ViewChild('content') sidenavContent: MatSidenavContent;

  constructor(
    private breakpointsService: BreakpointsService,
    private invitationQuery: InvitationQuery,
    private notificationQuery: NotificationQuery,
    private router: Router
  ) {}

  ngAfterViewInit() {
    // https://github.com/angular/components/issues/4280
    this.routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.sidenavContent.scrollTo({ top: 0 });
      });
  }

  ngOnDestroy() {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }
}
