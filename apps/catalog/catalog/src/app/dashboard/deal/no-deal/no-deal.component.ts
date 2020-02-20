import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Intercom } from 'ng-intercom';

@Component({
  selector: 'catalog-no-deal',
  templateUrl: './no-deal.component.html',
  styleUrls: ['./no-deal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoDealComponent {
  constructor(private intercom: Intercom) {}

  public openIntercom(): void {
    return this.intercom.show();
  }
}
