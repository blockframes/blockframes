
import { Component, ChangeDetectionStrategy, Pipe, PipeTransform } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs';
import { Query, queryChanges } from 'akita-ng-fire';
import { map, pluck, switchMap } from 'rxjs/operators';

import { Income } from '@blockframes/contract/income/+state';
import { Organization } from '@blockframes/organization/+state';
import { Contract } from '@blockframes/contract/contract/+state';
import { Offer, OfferService } from '@blockframes/contract/offer/+state';

export type ContractWithIncomes = Contract & { incomes: Income[]};
export type FullOffer = Offer & { buyerOrg: Organization, contracts: ContractWithIncomes[] };

@Component({
  selector: 'offer-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShellComponent {

  public offerId$ = this.route.params.pipe(pluck('offerId'));

  public offer$: Observable<FullOffer> = this.offerId$.pipe(
    switchMap(offerId => queryChanges.call(this.offerService, {
      path: 'offers',
      queryFn: ref => ref.where('id', '==', offerId),
      buyerOrg: (offer: Offer) => ({
        path: 'orgs',
        queryFn: ref => ref.where('id', '==', offer.buyerId),
      }),
      contracts: (offer: Offer) => ({
        path: 'contracts',
        queryFn: ref => ref.where('offerId', '==', offer.id),
        incomes: (contract: Contract) => ({
          path: 'incomes',
          queryFn: ref => ref.where('contractId', '==', contract.id),
        }),
      }),
    } as Query<FullOffer>)),
    map(offers => offers[0]),
    map(offer => {
      return {
        ...offer,
        buyerOrg: offer.buyerOrg[0],
      }
    }),
  );

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private offerService: OfferService,
  ) { }

  goBack() {
    this.location.back();
  }
}

@Pipe({ name: 'incomes', pure: true })
export class IncomesPipe implements PipeTransform {
  transform(offer: FullOffer) {
    return offer.contracts.reduce((acc, curr) => {
      const sumOfIncomes = curr.incomes.reduce((acc, curr) => acc + curr.price, 0);
      return acc + sumOfIncomes;
    }, 0);
  }
}
