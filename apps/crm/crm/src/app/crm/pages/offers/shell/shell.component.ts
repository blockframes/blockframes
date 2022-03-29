import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QueryConstraint, where } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { pluck, shareReplay, switchMap } from 'rxjs/operators';
import { OfferService } from '@blockframes/contract/offer/+state';
import { Income, IncomeService } from '@blockframes/contract/income/+state';
import { ContractService } from '@blockframes/contract/contract/+state';
import { OrganizationService } from '@blockframes/organization/+state';
import { joinWith } from '@blockframes/utils/operators';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { Contract, Offer, Organization } from '@blockframes/model';

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
    switchMap((offerId: string): Observable<Contract[]> => this.contractService.valueChanges([where('offerId', '==', offerId)])),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  public incomes$ = this.offerId$.pipe(
    switchMap((offerId: string): Observable<Income[]> => this.incomeService.valueChanges([where('offerId', '==', offerId)])),
  );

  constructor(
    private route: ActivatedRoute,
    private service: OfferService,
    private incomeService: IncomeService,
    private orgService: OrganizationService,
    private contractService: ContractService,
    private titleService: MovieService,
  ) { }

  getContracts(query: QueryConstraint[]) {
    return this.contractService.valueChanges(query).pipe(
      joinWith({
        negotiation: contract => {
          if (!contract) return null;
          return this.contractService.adminLastNegotiation(contract.id).pipe(
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
    const queryContracts = [where('offerId', '==', offerId), where('status', '!=', 'declined')];
    return this.getContracts(queryContracts);
  }

  getDeclinedContracts(offerId: string) {
    const queryContracts = [where('offerId', '==', offerId), where('status', '==', 'declined')];
    return this.getContracts(queryContracts);
  }

}
