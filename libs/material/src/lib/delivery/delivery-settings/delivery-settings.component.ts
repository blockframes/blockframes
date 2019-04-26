import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'delivery-settings',
  templateUrl: './delivery-settings.component.html',
  styleUrls: ['./delivery-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliverySettingsComponent implements OnInit {
  ngOnInit() {}
}
