import { Component, ChangeDetectionStrategy, Optional } from '@angular/core';
import { Intercom } from 'ng-intercom';

@Component({
  selector: 'catalog-negotiation',
  templateUrl: './negotiation.component.html',
  styleUrls: ['./negotiation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NegotiationComponent {


  constructor(
    @Optional() private intercom: Intercom,
  ) { }

  openIntercom() {
    this.intercom.show();
  }
}
