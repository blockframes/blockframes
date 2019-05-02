import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'delivery-empty',
  templateUrl: './delivery-empty.component.html',
  styleUrls: ['./delivery-empty.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryEmptyComponent {

  constructor() { }
}
