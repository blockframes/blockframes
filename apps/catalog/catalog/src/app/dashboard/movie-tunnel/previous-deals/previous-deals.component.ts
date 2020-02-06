import { toDate } from '@blockframes/utils/helpers';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormList } from '@blockframes/utils/form/forms/list.form';
import { ContractForm } from '@blockframes/contract/contract/form/contract.form';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import { DistributionDealHoldbacksForm } from '@blockframes/movie/distribution-deals/form/holdbacks/holdbacks.form';
import { ContractService } from '@blockframes/contract/contract/+state/contract.service';
import { DistributionDealService } from '@blockframes/movie/distribution-deals/+state';
import { DistributionDealForm } from '@blockframes/movie/distribution-deals/form/distribution-deal.form';

@Component({
  selector: 'catalog-tunnel-previous-deals',
  templateUrl: './previous-deals.component.html',
  styleUrls: ['./previous-deals.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TunnelPreviousDealsComponent implements OnInit, OnDestroy {
  public formContract: FormList<any, ContractForm> = FormList.factory(
    [{ id: this.newId(), titleIds: [this.movieId] }],
    contract => new ContractForm(contract)
  );
  public formDistributionDeal: FormList<any, DistributionDealForm> = FormList.factory(
    [],
    deal => new DistributionDealForm(deal)
  );

  private distMap: Record<string, DistributionDealForm[]> = {};

  private contractIds: string[];
  private dealsIds: string[];
  private toRemoveContracts: string[] = [];
  private toRemoveDeals: string[] = [];

  constructor(
    private routerQuery: RouterQuery,
    private contractService: ContractService,
    private dealsService: DistributionDealService,
    private changeDetector: ChangeDetectorRef,
    private db: AngularFirestore
  ) {}

  ngOnInit() {
    this.fetchData();
  }

  private async fetchData() {
    const { movieId } = this.routerQuery.getValue().state.root.params;
    const contracts = await this.contractService.getValue(ref => {
      return ref.where('titleIds', 'array-contains', movieId); // only contract on this movie
    });
    if (contracts.length) {
      this.formContract.patchAllValue(contracts);
    }
    this.contractIds = contracts.map(contract => contract.id);
    const deals = await this.dealsService.getValue({ params: { movieId } });
    for (const deal of deals) {
      if (!!deal.terms.start && !!deal.terms.end) {
        deal.terms.start = toDate(deal.terms.start);
        deal.terms.end = toDate(deal.terms.end);
      }
    }
    this.dealsIds = deals.map(deal => deal.id);
    if (deals.length) {
      this.formDistributionDeal.patchAllValue(deals);
    }
    this.changeDetector.markForCheck();
  }

  get movieId(): string {
    const { movieId } = this.routerQuery.getValue().state.root.params;
    return movieId;
  }

  private newId() {
    return this.db.createId();
  }

  public contractParties(index: number) {
    return this.formContract.at(index).get('parties');
  }

  public contractParty(index: number) {
    return this.formContract.at(index);
  }

  public distributionDealTerms(control: DistributionDealForm) {
    return control.get('terms');
  }

  public distributionDealHoldbacks(control: DistributionDealForm) {
    return control.get('holdbacks');
  }

  public distributionDealAssetLanguages(control: DistributionDealForm) {
    return control.get('assetLangauage');
  }

  public addHoldback(control: DistributionDealForm) {
    return control.get('holdbacks').push(new DistributionDealHoldbacksForm());
  }

  public removeHoldback(control: DistributionDealForm, holdbackIndex: number) {
    control.get('holdbacks').removeAt(holdbackIndex);
  }

  public addContract() {
    const id = this.newId();
    this.formContract.add({ id: id });
    this.formDistributionDeal.add({ contractId: id, id: this.newId() });
  }

  public contractToDeal(control: ContractForm) {
    const contractId = control.value.id;
    const deals = this.formDistributionDeal.controls.filter(
      enitity => enitity.value.contractId === contractId
    );
    if (deals.length) {
      return deals;
    } else {
      const id = this.newId();
      this.formDistributionDeal.add({ contractId: control.value.id, id: id });
      return [new DistributionDealForm({ contractId: control.value.id, id: id })];
    }
  }

  public addDistributionDeal(control: ContractForm) {
    const newDeal = this.formDistributionDeal.add({
      contractId: control.value.id,
      id: this.newId()
    });
    this.distMap[control.value.id] = [...this.distMap[control.value.id], newDeal];
    this.changeDetector.markForCheck();
  }

  public deleteContract(index: number) {
    const id = this.formContract.at(index).value.id;
    if (this.contractIds.includes(id)) {
      this.toRemoveContracts.push(id);
    }
    this.formContract.removeAt(index);
  }

  trackDeals(index, control) {
    return control.value.id;
  }

  ngOnDestroy() {
    this.contractService.update(this.formContract.value);
    this.dealsService.update(this.formDistributionDeal.value);
    this.contractService.remove(this.toRemoveContracts);
    this.dealsService.remove(this.toRemoveDeals);
  }
}
