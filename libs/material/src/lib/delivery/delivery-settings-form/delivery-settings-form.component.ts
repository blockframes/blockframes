import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'material-delivery-settings-form',
  templateUrl: './delivery-settings-form.component.html',
  styleUrls: ['./delivery-settings-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliverySettingsFormComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
