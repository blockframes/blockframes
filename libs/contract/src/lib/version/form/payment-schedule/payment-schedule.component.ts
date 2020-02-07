import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: '[form] contract-version-form-schedule',
  templateUrl: './payment-schedule.component.html',
  styleUrls: ['./payment-schedule.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractVersionPaymentScheduleComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
