import { Injectable } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class TunnelService {
  private currentUrl: string;
  public previousUrl: string;
  public isInTunnel = false;

  /** Keep in memory the preivous URL to come back to it when leaving the tunnel */
  constructor(private routerQuery: RouterQuery){
    this.routerQuery.select(({ state }) => state && state.url).pipe(
      filter(_ => !this.isInTunnel)
    ).subscribe(url => {
      this.previousUrl = this.currentUrl;
      this.currentUrl = url;
    });
  }
}
