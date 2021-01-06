import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TunnelStepData, TunnelStep } from '../../tunnel.model';
import { TunnelLayoutComponent } from '../layout.component';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

/**
 * Set the position of the page on the current panel
 * @example { index: 1, length: 3 } will look like 1/3 in the UI
 */
function getPageData(url: string, steps: TunnelStep[]): TunnelStepData {
  const pageUrl = url.split('/').pop();
  const step = steps.find(({ routes }) => routes.find(r => r.path === pageUrl));
  if (step) {
    const paths = step.routes.map(r => r.path);
    const index = paths.indexOf(pageUrl) + 1;
    return { index: index, length: step.routes.length, time: step.time };
  } else {
    return { index: 0, length: 0 };
  }
}

@Component({
  selector: 'tunnel-step-stat',
  templateUrl: './step-stat.component.html',
  styleUrls: ['./step-stat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TunnelStepStatComponent implements OnInit {

  stepData$: Observable<TunnelStepData>;

  constructor(private layout: TunnelLayoutComponent) { }

  ngOnInit() {
    this.stepData$ = this.layout.urlBynav$.pipe(
      filter(([url, steps]) => !!url && !!steps),
      map(([url, steps]) => getPageData(url, steps))
    );
  }
}
