
import { Component, ChangeDetectionStrategy, Pipe, PipeTransform } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs';
import { pluck, switchMap } from 'rxjs/operators';

import { Offer, OfferService } from '@blockframes/contract/offer/+state';
import { Income, IncomeService } from '@blockframes/contract/income/+state';
import { Contract, ContractService } from '@blockframes/contract/contract/+state';
import { Organization, OrganizationService } from '@blockframes/organization/+state';

@Component({
  selector: 'offer-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OfferShellComponent {

  public offerId$ = this.route.params.pipe(pluck('offerId'));

  public offer$ = this.offerId$.pipe(
    switchMap((offerId: string): Observable<Offer> => this.offerService.valueChanges(offerId)),
  );

  public buyerOrg$ = this.offer$.pipe(
    switchMap((offer: Offer): Observable<Organization> => this.orgService.valueChanges(offer.buyerId)),
  );

  public contracts$ = this.offerId$.pipe(
    switchMap((offerId: string): Observable<Contract[]> => this.contractService.valueChanges(ref => ref.where('offerId', '==', offerId))),
  );

  public incomes$ = this.offerId$.pipe(
    switchMap((offerId: string): Observable<Income[]> => this.incomeService.valueChanges(ref => ref.where('offerId', '==', offerId))),
  );

  constructor(
    private route: ActivatedRoute,
    private offerService: OfferService,
    private incomeService: IncomeService,
    private orgService: OrganizationService,
    private contractService: ContractService,
  ) { }

}
