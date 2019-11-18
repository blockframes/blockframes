import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { Component, ChangeDetectionStrategy, HostBinding, OnDestroy } from '@angular/core';

declare const gtag;

@Component({
  selector: 'auth-welcome-view',
  templateUrl: './welcome-view.component.html',
  styleUrls: ['./welcome-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WelcomeViewComponent implements OnDestroy {

  @HostBinding('attr.page-id') pageId = 'welcome-view';

  private subscription: Subscription;

  constructor(private router: Router) {
    const navEnds = this.router.events.pipe(filter(event => event instanceof NavigationEnd));
    this.subscription = navEnds.subscribe((event: NavigationEnd) => {
      console.log(event);
      gtag('config', 'G-Q4BWTRSV6P', {
        page_path: event.urlAfterRedirects
      })
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
