import { Component, ChangeDetectionStrategy, Pipe, PipeTransform, Input } from '@angular/core';
import { TunnelStep } from '../../tunnel.model';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { map } from 'rxjs/operators';

@Component({
  selector: '[steps]tunnel-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TunnelNavComponent {
  @Input() steps: TunnelStep[];
}

@Pipe({ name: 'stepActive' })
export class StepActivePipe implements PipeTransform {
  constructor(private route: RouterQuery) { }

  /**
   *  This pipe is used to open and keep open the good expansion panel when we are on a page inside the expansion panel.
   */
  transform(step: TunnelStep) {
    return this.route.select(state => state.state.url).pipe(
      map(url => url.split('/').pop()),
      map(suffix => step.routes.some(route => route.path === suffix)),
    );
  }
}
