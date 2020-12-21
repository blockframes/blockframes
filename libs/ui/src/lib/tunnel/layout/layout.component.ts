import { Component, OnInit, Input, ChangeDetectionStrategy, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { fade } from '@blockframes/utils/animations/fade';
import { TunnelStep, TunnelStepSnapshot } from '../tunnel.model';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { filter, map, shareReplay } from 'rxjs/operators';
import { BreakpointsService } from '@blockframes/utils/breakpoint/breakpoints.service';
import { MatSidenavContent } from '@angular/material/sidenav';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { RouteDescription } from '@blockframes/utils/common-interfaces';
import { routeAnimation } from '@blockframes/utils/animations/router-animations';

/**
 * @description returns the next or previous page where the router should go to
 * @param steps all the possible steps
 * @param url current url
 * @param arithmeticOperator plus or minus
 */
function getPage(steps: TunnelStep[], url: string, arithmeticOperator: number): RouteDescription {
  const allSections = steps.map(({ routes }) => routes);
  const allPath = allSections.flat();
  const currentPath = parseUrlWithoutFragment(url);
  const index = allPath.findIndex(route => route.path === currentPath)
  if (index >= 0) {
    return allPath[index + arithmeticOperator];
  }
}


function parseUrlWithoutFragment(url: string): string {
  return url.includes('#') ? url.split('#')[0].split('/').pop() : url.split('/').pop();
}

function getStepSnapshot(steps: TunnelStep[], url: string): TunnelStepSnapshot {
  const path = parseUrlWithoutFragment(url);
  for (const step of steps) {
    const route = step.routes.find(r => r.path === path);
    if (route) {
      return { ...step, route };
    }
  }
}

@Component({
  selector: '[exitRedirect] tunnel-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: [fade, routeAnimation],
  host: {
    'class': 'tunnel-layout',
    '[@fade]': 'fade'
  }
})
export class TunnelLayoutComponent implements OnInit, OnDestroy {

  private url$ = this.routerQuery.select('state').pipe(map(({ url }) => url))
  public urlBynav$: Observable<[string, TunnelStep[]]>;
  public currentStep: TunnelStepSnapshot;
  public next: RouteDescription;
  public previous: RouteDescription;
  public ltMd$ = this.breakpointsService.ltMd;

  @ViewChild(MatSidenavContent) sidenavContent: MatSidenavContent;

  @Input() steps: TunnelStep[];

  /** Fallback link to redirect on exit */
  @Input() exitRedirect: string;

  private sub: Subscription;

  constructor(
    private routerQuery: RouterQuery,
    private breakpointsService: BreakpointsService,
    private router: Router
  ) { }

  ngOnInit() {
    this.urlBynav$ = combineLatest([this.url$, new BehaviorSubject(this.steps).asObservable()]).pipe(shareReplay(1))

    // https://github.com/angular/components/issues/4280
    this.sub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.sidenavContent.scrollTo({ top: 0 })
        this.getRoute();
      })
    this.getRoute();
  }

  private getRoute() {
    const url = this.routerQuery.getValue().state.url;
    this.currentStep = getStepSnapshot(this.steps, url);
    this.next = getPage(this.steps, url, 1);
    this.previous = getPage(this.steps, url, -1);
  }

  animationOutlet(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.animation;
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
