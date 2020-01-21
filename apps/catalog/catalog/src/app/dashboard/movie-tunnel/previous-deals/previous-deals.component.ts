import { RouterQuery } from '@datorama/akita-ng-router-store';
import { PartyDetailsForm } from '@blockframes/contract/forms/contract.form';
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ContractForm } from '@blockframes/contract/forms/contract.form';
import { DistributionDealForm } from '@blockframes/movie/distribution-deals/form/distribution-deal.form';

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
  ) {
    this.formContract.valueChanges.subscribe(console.log);
    this.formDistributionDeal.valueChanges.subscribe(console.log);
  }

  ngOnInit() {
    this.addDefaultValue()
    
  }

  get contract() {
    return this.formContract.get('parties');
  }

  get distributionDeal() {
    return this.formDistributionDeal;
  }

  get activeMovieId(){
    return this.routerQuery.getValue().state.root.params.movieId;
  }

  private addDefaultValue() {
    // If there is alredy a second default party added, we don't want another one
    if(this.formContract.get('parties').controls.length <= 1) {
      this.formContract.get('parties').push(new PartyDetailsForm({party: {role: 'licensee'}}))
    }

     if(!this.formContract.get('titleIds').value) {
      this.formContract.get('titleIds').setValue(this.activeMovieId)
     } 
     if(this.formContract.get('lastVersion').get('titles').get(this.activeMovieId)) {}

  }
}
