import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContractService } from '@blockframes/contract/contract/+state';
import { OfferService } from '@blockframes/contract/offer/+state';
import { OrganizationService } from '@blockframes/organization/+state';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { joinWith } from '@blockframes/utils/operators';
import { switchMap } from 'rxjs/operators';
import { CollectionReference, QueryFn } from '@angular/fire/firestore';

@Component({
  selector: 'catalog-offer-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent {
  offers$ = this.orgService.currentOrg$.pipe(
    switchMap(org => this.service.valueChanges(query(org.id))),
    joinWith({
      contracts: offer => this.getContracts(offer.id)
    }, {shouldAwait:true}),
  )

  constructor(
    private orgService: OrganizationService,
    private service: OfferService,
    private contractService: ContractService,
    private titleService: MovieService,
  ) { }

  private getContracts(offerId: string) {
    const queryContracts = (ref: CollectionReference) => ref.where('offerId', '==', offerId);
    return this.contractService.valueChanges(queryContracts).pipe(
      joinWith({
        title: contract => this.titleService.valueChanges(contract.titleId),
        negotiation: contract => this.contractService.lastNegotiation(contract.id)
      })
    )
  }
}

const query: (orgId: string) => QueryFn = (orgId: string) => {
  return ref => ref.where('buyerId', '==', orgId).orderBy('_meta.createdAt', 'desc');
}
