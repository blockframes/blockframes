import { Injectable } from '@angular/core';
import { NavigationEnd, Router, Event } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class TunnelService {
  public currentUrl: string;
  public previousUrl: string;
  public isInTunnel = false;

  /** Keep in memory the previous URL to come back to it when leaving the tunnel */
  constructor(private router: Router) {
    this.router.events.pipe(
      filter(() => !this.isInTunnel),
      filter((event: Event) => event instanceof NavigationEnd),
    ).subscribe((event: NavigationEnd) => this.setUrls(event.url));
  }

  setUrls(url: string) {
    this.previousUrl = this.currentUrl;
    this.currentUrl = url;
  }
}
