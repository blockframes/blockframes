
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs';
import { pluck, shareReplay, switchMap } from 'rxjs/operators';

import { Offer, OfferService } from '@blockframes/contract/offer/+state';
import { Income, IncomeService } from '@blockframes/contract/income/+state';
import { Contract, ContractService } from '@blockframes/contract/contract/+state';
import { Organization, OrganizationService } from '@blockframes/organization/+state';
import { joinWith } from '@blockframes/utils/operators';
import { MovieService } from '@blockframes/movie/+state';
import { CollectionReference, QueryFn } from '@angular/fire/firestore';

@Component({
  selector: 'offer-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OfferShellComponent {

  public offerId$ = this.route.params.pipe(pluck('offerId'));

  public offer$ = this.offerId$.pipe(
    switchMap((offerId: string) => this.service.valueChanges(offerId)),
    joinWith({
      buyer: offer => this.orgService.valueChanges(offer.buyerId),
      contracts: offer => this.getNotDeclinedContracts(offer.id),
      declinedContracts: offer => this.getDeclinedContracts(offer.id),
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  public buyerOrg$ = this.offer$.pipe(
    switchMap((offer: Offer): Observable<Organization> => this.orgService.valueChanges(offer.buyerId)),
  );

  public contracts$ = this.offerId$.pipe(
    switchMap((offerId: string): Observable<Contract[]> => this.contractService.valueChanges(ref => ref.where('offerId', '==', offerId))),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  public incomes$ = this.offerId$.pipe(
    switchMap((offerId: string): Observable<Income[]> => this.incomeService.valueChanges(ref => ref.where('offerId', '==', offerId))),
  );

  constructor(
    private route: ActivatedRoute,
    private service: OfferService,
    private incomeService: IncomeService,
    private orgService: OrganizationService,
    private contractService: ContractService,
    private titleService: MovieService,
  ) { }

  getContracts(query: QueryFn) {
    return this.contractService.valueChanges(query).pipe(
      joinWith({
        negotiation: contract => {
          if (!contract) return null;
          return this.contractService.lastNegotiation(contract.id, { ignoreStakeholders: true }).pipe(
            joinWith({
              title: (nego) => this.titleService.valueChanges(nego.titleId),
              seller: (nego) => {
                // Get the ID of the seller, not AC
                const sellerId = contract.stakeholders.find(id => id !== nego.sellerId && id !== nego.buyerId);
                if (!sellerId) return null;
                return this.orgService.valueChanges(sellerId);
              }
            })
          );
        }
      }, { shouldAwait: true })
    );
  }

  getNotDeclinedContracts(offerId: string) {
    const queryContracts = (ref: CollectionReference) => ref.where('offerId', '==', offerId).where('status', '!=', 'declined');
    return this.getContracts(queryContracts);
  }

  getDeclinedContracts(offerId: string) {
    const queryContracts = (ref: CollectionReference) => ref.where('offerId', '==', offerId).where('status', '==', 'declined');
    return this.getContracts(queryContracts);
  }

}
