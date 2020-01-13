import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContractForm } from '@blockframes/contract/forms/contract.form';
import { DistributionDealForm } from '@blockframes/movie/distribution-deals/form/distribution-deal.form';
import { MatSlideToggleChange } from '@angular/material';

@Component({
  selector: 'catalog-tunnel-previous-deals',
  templateUrl: './previous-deals.component.html',
  styleUrls: ['./previous-deals.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TunnelPreviousDealsComponent {
  
  constructor(private formContract: ContractForm, private formDistributionDeal: DistributionDealForm) {}

  get contract() {
    return this.formContract.get('parties');
  }

  get distributionDeal() {
    return this.formDistributionDeal;
  }

  public updateForm(value: MatSlideToggleChange) {
    this.formDistributionDeal.get('exclusive').setValue(value.checked);
  }
}