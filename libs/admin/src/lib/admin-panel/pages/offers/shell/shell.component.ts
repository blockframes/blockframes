
import { Component, ChangeDetectionStrategy, Pipe, PipeTransform } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs';
import { queryChanges } from 'akita-ng-fire';
import { pluck, switchMap } from 'rxjs/operators';

import { Income } from '@blockframes/contract/income/+state';
import { Organization, OrganizationService } from '@blockframes/organization/+state';
import { Contract, ContractService } from '@blockframes/contract/contract/+state';
import { Offer, OfferService } from '@blockframes/contract/offer/+state';

export type ContractWithIncome = Contract & { income: Income };

const queryOrg = (offer: Offer) => ({ path: `orgs/${offer.buyerId}` });

const queryContracts = (offer: Offer) => ({
  path: 'contracts',
  queryFn: ref => ref.where('offerId', '==', offer.id),
  income: (contract: Contract) => ({
    path: `incomes/${contract.id}`,
  }),
});

@Component({
  selector: 'offer-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShellComponent {

  public offerId$ = this.route.params.pipe(pluck('offerId'));

  public offer$ = this.offerId$.pipe(
    switchMap((offerId: string): Observable<Offer> => this.offerService.valueChanges(offerId)),
  );

  public buyerOrg$ = this.offer$.pipe(
    switchMap((offer: Offer): Observable<Organization> => queryChanges.call(this.orgService, queryOrg(offer))),
  );

  public contracts$ = this.offer$.pipe(
    switchMap((offer: Offer): Observable<Contract[]> => queryChanges.call(this.contractService, queryContracts(offer))),
  );

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private offerService: OfferService,
    private orgService: OrganizationService,
    private contractService: ContractService,
  ) { }

}



@Pipe({ name: 'incomes', pure: true })
export class IncomesPipe implements PipeTransform {
  transform(contracts: ContractWithIncome[]) {
    return contracts.reduce((acc, curr) => acc + curr.income.price, 0);
  }
}
