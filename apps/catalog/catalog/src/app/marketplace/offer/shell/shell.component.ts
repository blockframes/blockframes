import { Component, OnInit, ChangeDetectionStrategy, Optional } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContractService } from '@blockframes/contract/contract/+state';
import { IncomeService } from '@blockframes/contract/income/+state';
import { OfferService } from '@blockframes/contract/offer/+state';
import { Intercom } from 'ng-intercom';
import { pluck, shareReplay, switchMap } from 'rxjs/operators';

@Component({
  selector: 'catalog-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShellComponent {
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

  constructor(
    private route: ActivatedRoute,
    private offerService: OfferService,
    private contractService: ContractService,
    private incomeService: IncomeService,
    @Optional() private intercom: Intercom
  ) { }

  openIntercom() {
    this.intercom.show();
  }
}
