import { Component, OnInit, Input, ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { fade } from '@blockframes/utils/animations/fade';
import { TunnelStep } from '../tunnel.model';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { MediaMatcher } from '@angular/cdk/layout';

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
  private _mobileQueryListener: () => void;
  public steps$ = this.navigation.asObservable();
  public urlBynav$: Observable<[string, TunnelStep[]]>;
  public next$: Observable<string>;
  public previous$: Observable<string>;
  public mobileQuery: MediaQueryList;

  @Input() set steps(steps: TunnelStep[]) {
    this.navigation.next(steps || []);
  }

  constructor(
    private routerQuery: RouterQuery,
    private changeDetectorRef: ChangeDetectorRef,
    private media: MediaMatcher
  ) {}

  ngOnInit() {
    // Share the url by navigation plan
    this.urlBynav$ = combineLatest([this.url$, this.steps$]).pipe(shareReplay());
    this.next$ = this.urlBynav$.pipe(map(([ url, steps ]) => getPage(steps, url, 1)));
    this.previous$ = this.urlBynav$.pipe(map(([ url, steps ]) => getPage(steps, url, -1)));

    this.mobileQuery = this.media.matchMedia('(max-width: 959px)');
    this._mobileQueryListener = () => this.changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeEventListener('change', this._mobileQueryListener);
  }

}


