// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';

// Blockframes


@Component({
  selector: 'waterfall-title-statements-coprod',
  templateUrl: './statements-coprod.component.html',
  styleUrls: ['./statements-coprod.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatementsCoprodComponent {

  path = '/assets/images/demo-cannes/outgoing-statements/Outgoing_1.svg';

  switch() {
    return; 
   /* if (this.path === '/assets/images/demo-cannes/outgoing-statements/Outgoing_1.svg') {
      this.path = '/assets/images/demo-cannes/outgoing-statements/Outgoing_2.svg';
    } else {
      this.path = '/assets/images/demo-cannes/outgoing-statements/Outgoing_1.svg';
    }*/
  }
}
