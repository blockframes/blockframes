import { Component, OnInit, Input, ChangeDetectionStrategy, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { fade } from '@blockframes/utils/animations/fade';
import { TunnelStep } from '../tunnel.model';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { map, shareReplay, filter, take } from 'rxjs/operators';
import { BreakpointsService } from '@blockframes/utils/breakpoint/breakpoints.service';
import { MatSidenavContent } from '@angular/material/sidenav';
import { Router, NavigationEnd } from '@angular/router';
import { RouteDescription } from '@blockframes/utils/common-interfaces/navigation';

/**
 * @description returns the next or previous page where the router should go to
 * @param current current url
 * @param arithmeticOperator plus or minus
 */
function getPage(steps: TunnelStep[], url: string, arithmeticOperator: number): RouteDescription {
  const allRoutes = steps.map(({ routes }) => routes);
  const allPath = allRoutes.flat();
  const current = parseUrlWithoutFragment(url)
  const index = allPath.map((route, i) => route.path === current ? i : undefined).filter(i => !!i);
  if (index[0] >= 0) {
    // TODO MF, check next or prev if also has conditional rendering, maybe you souldnt access the next two or three pages
    let shouldSkip: boolean;
    allPath[index[0] + arithmeticOperator]?.shouldDisplay?.pipe(take(1)).subscribe(value => shouldSkip = value)
    if (shouldSkip) {
      return allPath[index[0] + arithmeticOperator + arithmeticOperator]
    }
    return allPath[index[0] + arithmeticOperator];
  }
}

function parseUrlWithoutFragment(url: string): string {
  return url.includes('#') ? url.split('#')[0].split('/').pop() : url.split('/').pop();
}

@Component({
  selector: 'tunnel-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: [fade],
  host: {
    'class': 'tunnel-layout',
    '[@fade]': 'fade'
  }
})
export class TunnelLayoutComponent implements OnInit, OnDestroy {

  private navigation = new BehaviorSubject<TunnelStep[]>([]);
  private url$ = this.routerQuery.select(({ state }) => state.url);
  public steps$ = this.navigation.asObservable();
  public urlBynav$: Observable<[string, TunnelStep[]]>;
  public next$: Observable<RouteDescription>;
  public previous$: Observable<RouteDescription>;
  public ltMd$ = this.breakpointsService.ltMd;

  @ViewChild(MatSidenavContent) sidenavContent: MatSidenavContent;

  @Input() set steps(steps: TunnelStep[]) {
    this.navigation.next(steps || []);
  }

  /** Fallback link to redirect on exit */
  @Input() exitRedirect: string;

  private sub: Subscription;

  constructor(
    private routerQuery: RouterQuery,
    private breakpointsService: BreakpointsService,
    private router: Router
  ) { }

  ngOnInit() {
    // Share the url by navigation plan
    this.urlBynav$ = combineLatest([this.url$, this.steps$]).pipe(shareReplay());
    this.next$ = this.urlBynav$.pipe(map(([url, steps]) => getPage(steps, url, 1)));
    this.previous$ = this.urlBynav$.pipe(map(([url, steps]) => getPage(steps, url, -1)));
    // https://github.com/angular/components/issues/4280
    this.sub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.sidenavContent.scrollTo({ top: 0 }))
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}


