import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { TunnelService } from '../tunnel.service';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { map, share } from 'rxjs/operators';
import { TunnelNavigation, TunnelPageData } from './types';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';

/**
 * Set the position of the page on the current panel
 * @example { index: 1, length: 3 } will look like 1/3 in the UI
 */
function getPageData(nav: TunnelNavigation[], url: string): TunnelPageData {
  const pageUrl = url.split('/').pop();
  const allPages =  nav.map(({ routes }) => routes.map(r => r.path));
  const panel = allPages.find(page => page.includes(pageUrl));
  if (panel) {
    const index = panel.indexOf(pageUrl) + 1;
    const arrayLength = panel.length;
    return { index: index, length: arrayLength };
  } else {
    return { index: 0, length: 0 };
  }
}

/**
 * @description returns the next or previous page where the router should go to
 * @param current current url
 * @param arithmeticOperator plus or minus
 */
function getPage(nav: TunnelNavigation[], url: string, arithmeticOperator: number): string {
  const allRoutes = nav.map(({ routes }) => routes.map(r => r.path));
  const allPath = allRoutes.flat();
  const current = url.split('/').pop();
  const i: number = allPath.indexOf(current) + arithmeticOperator;
  return allPath[i];
}


@Component({
  selector: 'tunnel-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TunnelLayoutComponent implements OnInit {

  private url$ = this.routerQuery.select(({ state }) => state.url);
  private navigation = new BehaviorSubject<TunnelNavigation[]>([]);
  public navigation$ = this.navigation.asObservable();
  public next$: Observable<string>;
  public previous$: Observable<string>;
  public pageData$ ;
  public routeBeforeTunnel: string;

  @Input() set nav(nav: TunnelNavigation[]) {
    this.navigation.next(nav);
  }
  
  constructor(
    private service: TunnelService,
    private routerQuery: RouterQuery,
  ) { }

  ngOnInit() {
    this.routeBeforeTunnel = this.service.previousUrl;
    // Share the url by navigation plan
    const urlBynav$ = combineLatest([this.url$, this.navigation$]).pipe(share());
    this.next$ = urlBynav$.pipe(map(([ url, nav ]) => getPage(nav, url, 1)));
    this.previous$ = urlBynav$.pipe(map(([ url, nav ]) => getPage(nav, url, -1)));
    this.pageData$ = urlBynav$.pipe(map(([ url, nav ]) => getPageData(nav, url)));
  }

}


