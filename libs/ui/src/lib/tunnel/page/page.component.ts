import { Component, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { TunnelLayoutComponent } from '../layout/layout.component';

@Component({
  selector: 'tunnel-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class TunnelPageComponent {
  constructor(private layout: TunnelLayoutComponent) {}

  get page() {
    return this.layout.currenStep;
  }
}
