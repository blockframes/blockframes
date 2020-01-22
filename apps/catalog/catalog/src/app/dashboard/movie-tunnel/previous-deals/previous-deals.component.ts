import {
  ContractForm,
  PartyDetailsForm,
  ContractTitleDetailForm
} from '@blockframes/contract/contract/forms/contract.form';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { DistributionDealForm } from '@blockframes/movie/distribution-deals/form/distribution-deal.form';
import { ContractStatus } from '@blockframes/contract/contract/+state';

@Component({
  selector: 'catalog-tunnel-previous-deals',
  templateUrl: './previous-deals.component.html',
  styleUrls: ['./previous-deals.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TunnelPreviousDealsComponent implements OnInit {
  constructor(
    private formContract: ContractForm,
    private formDistributionDeal: DistributionDealForm,
    private routerQuery: RouterQuery
  ) {}

  ngOnInit() {
    this.addDefaultValue();
    console.log(this.formContract);
  }

  get contract() {
    return this.formContract.get('parties');
  }

  get distributionDeal() {
    return this.formDistributionDeal;
  }

  get distributionDealTerms() {
    return this.formDistributionDeal.get('terms');
  }

  get activeMovieId() {
    return this.routerQuery.getValue().state.root.params.movieId;
  }

  private addDefaultValue() {
    // If there is alredy a second default party added, we don't want another one
    if (!this.formContract.get('parties').controls[0]) {
      console.log('went here')
      this.formContract
        .get('parties')
        .push(
          new PartyDetailsForm({ party: { role: 'licensor' }, status: ContractStatus.accepted })
        );
    }

    if (!this.formContract.get('parties').controls[1]) {
      this.formContract
        .get('parties')
        .push(
          new PartyDetailsForm({ party: { role: 'licensee' }, status: ContractStatus.accepted })
        );
    }

    if (!this.formContract.get('titleIds').value) {
      this.formContract.get('titleIds').setValue(this.activeMovieId);
    }
/*     if (!this.formContract.get('versions').get('titles')) {
      this.formContract
        .get('versions')
        .get('titles')
        .setValue(this.activeMovieId, new ContractTitleDetailForm());
    } */
  }
}
