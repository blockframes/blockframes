import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'delivery-informations-editable',
  templateUrl: './delivery-informations-editable.component.html',
  styleUrls: ['./delivery-informations-editable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryInformationsEditableComponent implements OnInit {

  constructor(
    ) {}

  ngOnInit() {
  }
}
