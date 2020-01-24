import { ContractService } from '@blockframes/contract/contract/+state/contract.service';
import { FormList } from '@blockframes/utils/form/forms/list.form';
import { ContractForm } from '@blockframes/contract/contract/forms/contract.form';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { DistributionDealForm } from '@blockframes/movie/distribution-deals/form/distribution-deal.form';

@Component({
  selector: 'catalog-tunnel-previous-deals',
  templateUrl: './previous-deals.component.html',
  styleUrls: ['./previous-deals.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TunnelPreviousDealsComponent implements OnInit {
  private formContract = FormList.factory([], contract => new ContractForm(contract));
  private formDistributionDeal = new DistributionDealForm();

  public loading: boolean;

  constructor(private routerQuery: RouterQuery, private contractService: ContractService) {}

  async ngOnInit() {
    this.loading = true;
    const { movieId } = this.activeMovieId;
    const contracts = await this.contractService.getValue(
      ref =>
        ref
          .where(movieId, 'in', 'titleIds') // only contract on this movie
          .where('childContractIds', '==', []) // only without Archipel Content
    );
    for (const contract of contracts) {
      this.formContract.add(contract);
    }
    this.loading = false;
  }

  get contract() {
    return this.formContract.get('parties');
  }

  get distributionDeal() {
    return this.formDistributionDeal;
  }

  get contractParty() {
    return this.formContract.get('parties');
  }

  get distributionDealTerms() {
    return this.formDistributionDeal.get('terms');
  }

  get activeMovieId() {
    return this.routerQuery.getValue().state.root.params.movieId;
  }
}
