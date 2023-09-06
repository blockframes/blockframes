// Angular
import { Component } from '@angular/core';

@Component({
  selector: 'waterfall-title-avails',
  templateUrl: './avails.component.html',
  styleUrls: ['./avails.component.scss'],
})
export class AvailsComponent {

  path = '/assets/images/demo-cannes/world sales.svg';

  switch() {
    if(this.path === '/assets/images/demo-cannes/world sales.svg') {
      this.path = '/assets/images/demo-cannes/World_Sales_2.svg';
    } else {
      this.path = '/assets/images/demo-cannes/world sales.svg';
    }
  }
}
