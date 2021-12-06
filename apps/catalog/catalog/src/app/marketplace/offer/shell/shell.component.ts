import { Component, ChangeDetectionStrategy, Optional } from '@angular/core';
import { CollectionReference } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { ContractService, Sale } from '@blockframes/contract/contract/+state';
import { IncomeService } from '@blockframes/contract/income/+state';
import { OfferService } from '@blockframes/contract/offer/+state';
import { MovieService } from '@blockframes/movie/+state';
import { joinWith } from '@blockframes/utils/operators';
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
      contracts: offer => this.getContracts(offer.id),
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  constructor(
    private route: ActivatedRoute,
    private offerService: OfferService,
    private contractService: ContractService,
    private incomeService: IncomeService,
    private titleService: MovieService,
    @Optional() private intercom?: Intercom
  ) { }

  private getContracts(offerId: string) {
    const queryContracts = (ref: CollectionReference) => ref.where('offerId', '==', offerId).where('status', '!=', 'declined')
    return this.contractService.valueChanges(queryContracts).pipe(
      joinWith({
        title: contract => this.titleService.valueChanges(contract.titleId),
        income: contract => this.incomeService.valueChanges(contract.id),
        negotiation: contract => ['pending', 'negotiating'].includes(contract.status) ? this.contractService.lastNegotiation(contract.id) : null,
      })
    );
  }

  openIntercom() {
    this.intercom?.show();
  }
}
