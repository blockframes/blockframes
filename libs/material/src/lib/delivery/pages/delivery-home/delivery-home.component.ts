import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'delivery-home',
  templateUrl: './delivery-home.component.html',
  styleUrls: ['./delivery-home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryHomeComponent implements OnInit {


  constructor() {}

  ngOnInit() {

  }

}
