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

  path = '/assets/images/demo-cannes/Right Holders Involved_1.svg';

  switch() {
    if (this.path === '/assets/images/demo-cannes/Right Holders Involved_1.svg') {
      this.path = '/assets/images/demo-cannes/Right Holders Involved_2.svg';
    } else {
      this.path = '/assets/images/demo-cannes/Right Holders Involved_1.svg';
    }
  }
}
