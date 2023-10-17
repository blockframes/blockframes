// Angular
import { Component } from '@angular/core';

@Component({
  selector: 'waterfall-title-avails',
  templateUrl: './avails.component.html',
  styleUrls: ['./avails.component.scss'],
})
export class AvailsComponent {

  path = '/assets/images/demo-cannes/Avails_first.svg';

  switch() {
    if (this.path === '/assets/images/demo-cannes/Avails_first.svg') {
      this.path = '/assets/images/demo-cannes/Avails_second.svg';
    } else {
      this.path = '/assets/images/demo-cannes/Avails_first.svg';
    }
  }
}
