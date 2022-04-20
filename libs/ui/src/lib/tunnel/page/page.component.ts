import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TunnelLayoutComponent } from '../layout/layout.component';

@Component({
  selector: 'tunnel-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class TunnelPageComponent {
  constructor(private layout: TunnelLayoutComponent) { }

  page$ = this.layout.currentStep$;
}
