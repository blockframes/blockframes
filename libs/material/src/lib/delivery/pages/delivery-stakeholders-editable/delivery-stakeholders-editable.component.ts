import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { createOrganizationFormList } from '../../forms/stakeholders.form';
import { Delivery, DeliveryQuery } from '../../+state';
import { Observable } from 'rxjs';

@Component({
  selector: 'delivery-stakeholders-editable',
  templateUrl: './delivery-stakeholders-editable.component.html',
  styleUrls: ['./delivery-stakeholders-editable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryStakeholdersEditableComponent implements OnInit {
  public opened = false;

  public membersFormList = createOrganizationFormList();

  public delivery$: Observable<Delivery>;

  constructor(private deliveryQuery: DeliveryQuery) {}

  ngOnInit() {
    this.delivery$ = this.deliveryQuery.selectActive();
  }
}
