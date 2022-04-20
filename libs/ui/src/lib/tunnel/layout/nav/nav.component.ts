import { Component, ChangeDetectionStrategy, Pipe, PipeTransform, Input } from '@angular/core';
import { TunnelStep } from '../../tunnel.model';
import { map } from 'rxjs/operators';
import { TunnelLayoutComponent } from '../layout.component';

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
  constructor(private layout: TunnelLayoutComponent) { }

  /**
   *  This pipe is used to open and keep open the good expansion panel when we are on a page inside the expansion panel.
   */
  transform(step: TunnelStep) {
    return this.layout.currentStep$.pipe(
      map(suffix => step.routes.some(route => route.path === suffix.route.path)),
    );
  }
}
