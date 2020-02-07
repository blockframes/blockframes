import { Component, OnInit, Input, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { TunnelStep } from '../tunnel.model';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';



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
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'tunnel-layout'
  }
})
export class TunnelLayoutComponent implements OnInit {

  private navigation = new BehaviorSubject<TunnelStep[]>([]);
  private url$ = this.routerQuery.select(({ state }) => state.url);
  public steps$ = this.navigation.asObservable();
  public urlBynav$: Observable<[string, TunnelStep[]]>;
  public next$: Observable<string>;
  public previous$: Observable<string>;

  @Input() set steps(steps: TunnelStep[]) {
    this.navigation.next(steps || []);
  }
  
  constructor(private routerQuery: RouterQuery) { }

  ngOnInit() {
    // Share the url by navigation plan
    this.urlBynav$ = combineLatest([this.url$, this.steps$]).pipe(shareReplay());
    this.next$ = this.urlBynav$.pipe(map(([ url, steps ]) => getPage(steps, url, 1)));
    this.previous$ = this.urlBynav$.pipe(map(([ url, steps ]) => getPage(steps, url, -1)));
  }

}


