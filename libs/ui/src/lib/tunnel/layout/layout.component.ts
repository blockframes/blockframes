import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { TunnelService } from '../tunnel.service';
import { TunnelStep, TunnelStepData } from '../tunnel.model';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';

/**
 * Set the position of the page on the current panel
 * @example { index: 1, length: 3 } will look like 1/3 in the UI
 */
function getPageData(steps: TunnelStep[], url: string): TunnelStepData {
  const pageUrl = url.split('/').pop();
  const allPages =  steps.map(({ routes }) => routes.map(r => r.path));
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
function getPage(steps: TunnelStep[], url: string, arithmeticOperator: number): string {
  const allRoutes = steps.map(({ routes }) => routes.map(r => r.path));
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
  private navigation = new BehaviorSubject<TunnelStep[]>([]);
  public steps$ = this.navigation.asObservable();
  public next$: Observable<string>;
  public previous$: Observable<string>;
  public stepData$: Observable<TunnelStepData>;
  public routeBeforeTunnel: string;

  @Input() set steps(steps: TunnelStep[]) {
    this.navigation.next(steps);
  }
  
  constructor(
    private service: TunnelService,
    private routerQuery: RouterQuery,
  ) { }

  ngOnInit() {
    this.routeBeforeTunnel = this.service.previousUrl;
    // Share the url by navigation plan
    const urlBynav$ = combineLatest([this.url$, this.steps$]).pipe(share());
    this.next$ = urlBynav$.pipe(map(([ url, steps ]) => getPage(steps, url, 1)));
    this.previous$ = urlBynav$.pipe(map(([ url, steps ]) => getPage(steps, url, -1)));
    this.stepData$ = urlBynav$.pipe(map(([ url, steps ]) => getPageData(steps, url)));
  }

}


