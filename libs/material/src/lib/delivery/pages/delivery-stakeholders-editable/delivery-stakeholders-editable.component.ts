import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { createOrganizationFormList } from '../../forms/stakeholders.form';
import { Delivery, DeliveryQuery, DeliveryService } from '../../+state';
import { Observable } from 'rxjs';
import { OrganizationAlgoliaResult } from '@blockframes/utils';
import { StakeholderService } from '@blockframes/movie';

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

  constructor(
    private deliveryQuery: DeliveryQuery,
    private service: DeliveryService,
    private stakeholderService: StakeholderService,
    private query: DeliveryQuery
  ) {}

  ngOnInit() {
    this.delivery$ = this.deliveryQuery.selectActive();
  }

  public removeStakeholder(stakeholderId: string) {
    this.service.removeStakeholder(stakeholderId);
  }

  public addStakeholder({ objectID }: OrganizationAlgoliaResult) {
    // TODO: handle promises correctly (update loading status, send back error report, etc). => ISSUE#612
    const delivery = this.query.getActive();
    this.stakeholderService.addStakeholder(delivery, objectID);
  }
}
