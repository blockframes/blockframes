import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TunnelLayoutComponent } from '../layout.component';

@Component({
  selector: 'tunnel-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TunnelNavComponent {

  public steps$ = this.layout.steps$;

  constructor(private layout: TunnelLayoutComponent) { }
}
