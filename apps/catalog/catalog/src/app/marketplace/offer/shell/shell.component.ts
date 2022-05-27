import { Component, ChangeDetectionStrategy, Optional } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContractService } from '@blockframes/contract/contract/service';
import { OfferService } from '@blockframes/contract/offer/service';
import { MovieService } from '@blockframes/movie/service';
import { joinWith } from 'ngfire';
import { where } from 'firebase/firestore';
import { Intercom } from 'ng-intercom';
import { pluck, shareReplay, switchMap } from 'rxjs/operators';


@Component({
  selector: 'catalog-offer-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OfferShellComponent {
  private offerId$ = this.route.params.pipe(pluck<Record<string, string>, string>('offerId'));

  offer$ = this.offerId$.pipe(
    switchMap((id: string) => this.offerService.valueChanges(id)),
    joinWith({
      contracts: (offer) => this.getContracts(offer.id),
      declinedContracts: (offer) => this.declinedContracts(offer.id)
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(
    private route: ActivatedRoute,
    private offerService: OfferService,
    private contractService: ContractService,
    private titleService: MovieService,
    @Optional() private intercom?: Intercom
  ) { }

  private declinedContracts(offerId: string) {
    const declinedContracts = [where('offerId', '==', offerId), where('status', '==', 'declined')];
    return this.contractService.valueChanges(declinedContracts).pipe(
      joinWith({
        title: contract => this.titleService.valueChanges(contract.titleId),
        negotiation: contract => this.contractService.lastNegotiation(contract.id)
      })
    );
  }

  private getContracts(offerId: string) {
    const queryContracts = [where('offerId', '==', offerId), where('status', '!=', 'declined')];
    return this.contractService.valueChanges(queryContracts).pipe(
      joinWith({
        title: contract => this.titleService.valueChanges(contract.titleId),
        negotiation: contract => this.contractService.lastNegotiation(contract.id),
      })
    );
  }

  openIntercom() {
    this.intercom?.show();
  }
}
