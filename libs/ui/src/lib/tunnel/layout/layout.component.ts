import { Component, OnInit, Input, ChangeDetectionStrategy, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { fade } from '@blockframes/utils/animations/fade';
import { TunnelStep } from '../tunnel.model';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { map, shareReplay, filter, take } from 'rxjs/operators';
import { BreakpointsService } from '@blockframes/utils/breakpoint/breakpoints.service';
import { MatSidenavContent } from '@angular/material/sidenav';
import { Router, NavigationEnd } from '@angular/router';

/**
 * @description returns the next or previous page where the router should go to
 * @param steps all the possible steps
 * @param url current url
 * @param arithmeticOperator plus or minus
 */
function getPage(steps: TunnelStep[], url: string, arithmeticOperator: number): string {
  const allSections = steps.map(({ routes }) => routes);
  const allPath = allSections.flat();
  const currentPath = parseUrlWithoutFragment(url)
  const currentIndex = allPath.map((route, i) => route.path === currentPath ? i : undefined).filter(i => !!i);
  const allPathsThatShouldBeHidden = allPath.map((path, i) => {
    let shouldSkip: boolean;
    path.shouldDisplay?.pipe(take(1)).subscribe(value => shouldSkip = value)
    if (shouldSkip) {
      return i
    }
  }).filter(i => !!i);
  if (currentIndex[0] >= 0) {
    if (allPathsThatShouldBeHidden.includes(currentIndex[0] + arithmeticOperator)) {
      /* One big issue persists and this is if two forbidden routes comes just one after the other
      then this `+ arithmeticOperator` would not do the trick */
      return allPath[currentIndex[0] + arithmeticOperator + arithmeticOperator].path
    }
    return allPath[currentIndex[0] + arithmeticOperator].path;
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
  public next$: Observable<string>;
  public previous$: Observable<string>;
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


