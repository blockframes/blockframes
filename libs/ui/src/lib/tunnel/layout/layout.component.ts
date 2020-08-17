import { Component, OnInit, Input, ChangeDetectionStrategy, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { fade } from '@blockframes/utils/animations/fade';
import { TunnelStep } from '../tunnel.model';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { map, shareReplay, filter } from 'rxjs/operators';
import { BreakpointsService } from '@blockframes/utils/breakpoint/breakpoints.service';
import { MatSidenavContent } from '@angular/material/sidenav';
import { Router, NavigationEnd } from '@angular/router';

/**
 * @description returns the next or previous page where the router should go to
 * @param current current url
 * @param arithmeticOperator plus or minus
 */
function getPage(steps: TunnelStep[], url: string, arithmeticOperator: number): string {
  const allRoutes = steps.map(({ routes }) => routes.map(r => r.path));
  const allPath = allRoutes.flat();
  const current = url.split('/').pop();
  const index = allPath.indexOf(current);
  if (index >= 0) {
    return allPath[index + arithmeticOperator];
  }
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
  /*   steps.unshift({ title: 'Title Status', routes: [{ path: 'title-status', label: 'Title Status' }], icon: 'document', }); */
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


