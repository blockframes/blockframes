import { Component, OnInit, ChangeDetectionStrategy, Optional } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Contract, ContractService } from '@blockframes/contract/contract/+state';
import { Income, IncomeService } from '@blockframes/contract/income/+state';
import { OfferService } from '@blockframes/contract/offer/+state';
import { Intercom } from 'ng-intercom';
import { combineLatest } from 'rxjs';
import { map, pluck, shareReplay, switchMap } from 'rxjs/operators';

type FullContract = Contract & Income;
function mergeContracts(contracts: Contract[], incomes: Income[]): Record<string, FullContract> {
  const result: Record<string, FullContract> = {};
  for (const contract of contracts) {
    const income = incomes.find(income => income.id === contract.id);
    result[contract.id] = {
      ...contract,
      ...income,
    }
  }
  return result;
}

@Component({
  selector: 'catalog-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OfferShellComponent {
  private offerId$ =  this.route.params.pipe(pluck<Record<string, string>, string>('offerId'));

  offer$ = this.offerId$.pipe(
    switchMap((id: string) => this.offerService.valueChanges(id)),
  );

  contracts$ = this.offerId$.pipe(
    switchMap(id => this.contractService.valueChanges(ref => ref.where('offerId', '==', id))),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  incomes$ = this.offerId$.pipe(
    switchMap(id => this.incomeService.valueChanges(ref => ref.where('offerId', '==', id))),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  fullContracts$ = combineLatest([
    this.contracts$,
    this.incomes$
  ]).pipe(
    map(([contracts, incomes]) => mergeContracts(contracts, incomes))
  );

  constructor(
    private route: ActivatedRoute,
    private offerService: OfferService,
    private contractService: ContractService,
    private incomeService: IncomeService,
    @Optional() private intercom?: Intercom
  ) { }

  openIntercom() {
    this.intercom?.show();
  }
}
