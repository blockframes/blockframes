// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';

// Blockframes


@Component({
  selector: 'waterfall-title-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartsComponent {

  path = '/assets/images/demo-cannes/Right Holders Involved-a.svg';

  switch() {
    if (this.path === '/assets/images/demo-cannes/Right Holders Involved-a.svg') {
      this.path = '/assets/images/demo-cannes/Right Holders Involved-b.svg';
    } else if (this.path === '/assets/images/demo-cannes/Right Holders Involved-b.svg') {
      this.path = '/assets/images/demo-cannes/Right Holders Involved-c.svg';
    } else {
      this.path = '/assets/images/demo-cannes/Right Holders Involved-a.svg';
    }
  }
}
