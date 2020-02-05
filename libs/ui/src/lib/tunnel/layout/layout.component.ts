import { Component, OnInit, Input, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { TunnelService } from '../tunnel.service';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { map, shareReplay } from 'rxjs/operators';
import { TunnelNavigation, TunnelStepData } from './types';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { fade } from '@blockframes/utils/animations/fade';

/**
 * Set the position of the page on the current panel
 * @example { index: 1, length: 3 } will look like 1/3 in the UI
 */
function getStepData(nav: TunnelNavigation[], url: string): TunnelStepData {
  const pageUrl = url.split('/').pop();
  for (const step of nav) {
    const paths = step.routes.map(route => route.path);
    const index = paths.indexOf(pageUrl);
    if (index < 0) {
      continue;
    }
    return { index: index + 1, length: paths.length, time: step.time }
  }
  return { index: 0, length: 0 };
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
  host: { class: 'tunnel-layout' },
  animations: [fade],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TunnelLayoutComponent implements OnInit {

  @HostBinding('@fade') fadeIn;

  private url$ = this.routerQuery.select(({ state }) => state.url);
  private navigation = new BehaviorSubject<TunnelNavigation[]>([]);
  public navigation$ = this.navigation.asObservable();
  public next$: Observable<string>;
  public previous$: Observable<string>;
  public stepData$: Observable<TunnelStepData>;
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
    const urlBynav$ = combineLatest([this.url$, this.navigation$]).pipe(shareReplay());
    this.next$ = urlBynav$.pipe(map(([ url, nav ]) => getPage(nav, url, 1)));
    this.previous$ = urlBynav$.pipe(map(([ url, nav ]) => getPage(nav, url, -1)));
    this.stepData$ = urlBynav$.pipe(map(([ url, nav ]) => getStepData(nav, url)));
  }

}


