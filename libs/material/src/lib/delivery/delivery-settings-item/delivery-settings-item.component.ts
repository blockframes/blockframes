import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'material-delivery-settings-item',
  templateUrl: './delivery-settings-item.component.html',
  styleUrls: ['./delivery-settings-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliverySettingsItemComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
