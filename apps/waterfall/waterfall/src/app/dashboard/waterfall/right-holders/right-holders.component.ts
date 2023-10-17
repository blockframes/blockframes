// Angular
import { Component } from '@angular/core';

@Component({
  selector: 'waterfall-right-holders',
  templateUrl: './right-holders.component.html',
  styleUrls: ['./right-holders.component.scss'],

})
export class RightHoldersComponent {
  path = '/assets/images/demo-cannes/Creation_Waterfall_1.svg';

  switch() {
    if (this.path === '/assets/images/demo-cannes/Creation_Waterfall_1.svg') {
      this.path = '/assets/images/demo-cannes/Creation_Waterfall_2.svg';
    } else if (this.path === '/assets/images/demo-cannes/Creation_Waterfall_2.svg') {
      this.path = '/assets/images/demo-cannes/Creation_Waterfall_3.svg';
    } else if (this.path === '/assets/images/demo-cannes/Creation_Waterfall_3.svg') {
      this.path = '/assets/images/demo-cannes/Creation Interactive.svg';
    } else {
      this.path = '/assets/images/demo-cannes/Creation_Waterfall_1.svg';
    }
  }
}

