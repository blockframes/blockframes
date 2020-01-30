import { AngularFirestore } from '@angular/fire/firestore';
import { isTimestamp } from '@blockframes/utils/helpers';
import { FormList } from '@blockframes/utils/form/forms/list.form';
import { ContractForm } from '@blockframes/contract/contract/forms/contract.form';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import { DistributionDealForm } from '@blockframes/movie/distribution-deals/form/distribution-deal.form';
import { DistributionDealHoldbacksForm } from '@blockframes/movie/distribution-deals/form/holdbacks/holdbacks.form';
import { ContractService } from '@blockframes/contract/contract/+state/contract.service';
import { DistributionDealService } from '@blockframes/movie/distribution-deals/+state';
import { ContractStatus, Contract } from '@blockframes/contract/contract/+state';

@Component({
  selector: 'catalog-tunnel-previous-deals',
  templateUrl: './previous-deals.component.html',
  styleUrls: ['./previous-deals.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TunnelPreviousDealsComponent implements OnInit, OnDestroy {
  public formContract: FormList<any, ContractForm> = FormList.factory(
    [],
    newContract => new ContractForm(newContract || this.contractInitialValues)
  );
  public formDistributionDeal: FormList<any, DistributionDealForm> = FormList.factory(
    [],
    newDeal =>
      new DistributionDealForm(newDeal || { contractId: this.idForInitPage, id: this.newId })
  );

  // Dont use this variable, only for init page
  private idForInitPage = this.newId;

  private contractInitialValues = {
    id: this.idForInitPage,
    parties: [
      {
        party: { role: 'licensor', showName: true },
        status: ContractStatus.accepted
      },
      {
        party: { role: 'licensee', showName: true },
        status: ContractStatus.accepted
      }
    ],
    titleIds: [this.movieId],
    versions: [
      {
        status: ContractStatus.accepted,
        titles: {
          [this.movieId]: {
            distributionDealIds: [this.idForInitPage],
            titleId: this.movieId,
            price: { amount: 0, currency: 'euro' }
          }
        }
      }
    ]
  } as Partial<Contract>;

  constructor(
    private routerQuery: RouterQuery,
    private contractService: ContractService,
    private dealsService: DistributionDealService,
    private changeDetector: ChangeDetectorRef,
    private db: AngularFirestore
  ) {}

  async ngOnInit() {
    const { movieId } = this.routerQuery.getValue().state.root.params;
    const contracts = await this.contractService.getValue(ref => {
      return ref.where('titleIds', 'array-contains', movieId); // only contract on this movie
    });
    for (const contract of contracts) {
      this.formContract.add(contract);
    }
    const deals = await this.dealsService.getValue({ params: { movieId } });
    for (const deal of deals) {
      if (isTimestamp(deal.terms.start) && isTimestamp(deal.terms.end)) {
        deal.terms.start = deal.terms.start.toDate();
        deal.terms.end = deal.terms.end.toDate();
      }
      this.formDistributionDeal.add(deal);
    }
    this.changeDetector.markForCheck();
  }

  get movieId(): string {
    const { movieId } = this.routerQuery.getValue().state.root.params;
    return movieId;
  }

  get newId() {
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
    const newContract = this.contractInitialValues;
    newContract.id = this.newId;
    this.formContract.add(new ContractForm(newContract));
    this.formDistributionDeal.add(
      new DistributionDealForm({ contractId: newContract.id, id: this.newId })
    );
  }

  public contractToDeal(control: ContractForm) {
    const contractId = control.value.id;
    const deals = this.formDistributionDeal.controls.filter(
      enitity => enitity.value.contractId === contractId
    );
    if (!!deals) {
      this.formDistributionDeal.add(
        new DistributionDealForm({ contractId: control.value.id, id: this.newId })
      );
      this.changeDetector.markForCheck();
      return this.formDistributionDeal.controls;
    }
    this.changeDetector.markForCheck();
    return deals;
  }

  public addDistributionDeal(control: ContractForm) {
    this.formDistributionDeal.add(new DistributionDealForm({ id: control.value.id }));
    this.changeDetector.markForCheck();
  }

  public deleteContract(index: number) {
    this.formContract.removeAt(index);
  }

  ngOnDestroy() {
    this.contractService.upsert(this.formContract);
    this.dealsService.upsert(this.formDistributionDeal);
  }
}
