import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContractService } from '@blockframes/contract/contract/+state';
import { OfferService } from '@blockframes/contract/offer/+state';
import { OrganizationService } from '@blockframes/organization/+state';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { joinWith } from '@blockframes/utils/operators';
import { switchMap } from 'rxjs/operators';
import { orderBy, QueryConstraint, where } from 'firebase/firestore';

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
    }, { shouldAwait: true }),
  )

  constructor(
    private orgService: OrganizationService,
    private service: OfferService,
    private contractService: ContractService,
    private titleService: MovieService,
  ) { }

  private getContracts(offerId: string) {
    return this.contractService.valueChanges([where('offerId', '==', offerId)]).pipe(
      joinWith({
        title: contract => this.titleService.valueChanges(contract.titleId),
        negotiation: contract => this.contractService.lastNegotiation(contract.id)
      })
    )
  }
}

const query: (orgId: string) => QueryConstraint[] = (orgId: string) => {
  return [where('buyerId', '==', orgId), orderBy('_meta.createdAt', 'desc')];
}
