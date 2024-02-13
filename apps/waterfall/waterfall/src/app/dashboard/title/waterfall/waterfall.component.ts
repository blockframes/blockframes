// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';

// Blockframes

@Component({
  selector: 'waterfall-title-waterfall',
  templateUrl: './waterfall.component.html',
  styleUrls: ['./waterfall.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallComponent  {

  path = '/assets/images/demo-cannes/Waterfall.svg';



  switch() {
    if (this.path === '/assets/images/demo-cannes/Waterfall.svg') {
      this.path = '/assets/images/demo-cannes/Waterfall_2.svg';
    } else {
      this.path = '/assets/images/demo-cannes/Waterfall.svg';
    }
  }
}
