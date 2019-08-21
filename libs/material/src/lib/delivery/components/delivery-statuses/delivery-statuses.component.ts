import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DeliveryQuery } from '../../+state';

@Component({
  selector: 'delivery-statuses',
  templateUrl: './delivery-statuses.component.html',
  styleUrls: ['./delivery-statuses.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryStatusesComponent {
  public constructor(private query: DeliveryQuery) {}
}
