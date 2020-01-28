import { FormList } from '@blockframes/utils/form/forms/list.form';
import { ContractForm } from '@blockframes/contract/contract/forms/contract.form';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { DistributionDealForm } from '@blockframes/movie/distribution-deals/form/distribution-deal.form';
import { DistributionDealHoldbacksForm } from '@blockframes/movie/distribution-deals/form/holdbacks/holdbacks.form';

@Component({
  selector: 'catalog-tunnel-previous-deals',
  templateUrl: './previous-deals.component.html',
  styleUrls: ['./previous-deals.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TunnelPreviousDealsComponent implements OnInit {
  public formContract: FormList<any, ContractForm>;
  public formDistributionDeal: FormList<any, DistributionDealForm>;

  public loading: boolean;

  constructor(private routerQuery: RouterQuery) {}

  ngOnInit() {}

  public contract(index: number) {
    return this.formContract.at(index);
  }

  public distributionDeal(index: number) {
    return this.formDistributionDeal.at(index);
  }

  public contractParty(index: number) {
    return this.formContract.at(index);
  }

  public distributionDealTerms(index: number) {
    return this.formDistributionDeal.at(index).get('terms');
  }

  public distributionDealHoldbacks(index: number) {
    return this.formDistributionDeal.at(index).get('holdbacks');
  }

  public distributionDealAssetLanguages(index: number) {
    return this.formDistributionDeal.at(index).get('assetLangauage');
  }

  public addHoldback(index: number) {
    return this.distributionDealHoldbacks(index).push(new DistributionDealHoldbacksForm())
  }

  public removeHoldback(index: number, holdbackIndex: number) {
    return this.distributionDealHoldbacks(index).removeAt(holdbackIndex);
  }

  public addContract() {
    if (!this.formContract) {
      this.formContract = FormList.factory([], contract => new ContractForm(contract));
      this.formDistributionDeal = FormList.factory([], deals => new DistributionDealForm(deals));
    } else {
      this.formContract.add(); // specific to FormList
      this.formDistributionDeal.add();
    }
  }

  public addDistributionDeal() {
    this.formDistributionDeal.add();
  }
}
