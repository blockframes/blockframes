import {
  Component, ChangeDetectionStrategy, Optional
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Contract, ContractService } from '@blockframes/contract/contract/+state';
import { OfferService, OfferStatus } from '@blockframes/contract/offer/+state';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map, pluck, shareReplay, switchMap } from 'rxjs/operators';
import { Intercom } from 'ng-intercom';
import { Term } from '@blockframes/contract/term/+state';
import { Query, queryChanges } from 'akita-ng-fire';


type ContractWithTerms = Contract<Date> & { terms: Term[], };


@Component({
  selector: 'catalog-contract-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogContractViewComponent {

  offer$ = this.route.params.pipe(
    pluck('offerId'),
    switchMap((id: string) => this.offerService.valueChanges(id))
  );

  contract$ = this.route.params.pipe(
    pluck('contractId'),
    switchMap((id: string) => {
      this.contractService.valueChanges(id)
      const queryContract: Query<ContractWithTerms> = {
        path: `contracts/${id}`,
        terms: (contract: Contract<Date>) => ({
          path: 'terms',
          queryFn: ref => ref.where('id', 'in', contract.termIds),
        }),
      }
      return queryChanges.call(this.contractService, queryContract).pipe(
        map(contract => ({
          ...contract,
          terms: contract.terms.map(term => {
            console.log({ term })
            return ({
              ...term,
              duration: { from: term.duration.from.toDate(), to: term.duration.to.toDate() }
            })
          })
        }))
      )
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  loading$ = new BehaviorSubject<boolean>(false);

  constructor(
    private offerService: OfferService,
    private contractService: ContractService,
    private route: ActivatedRoute,
    private snackbar: MatSnackBar,
    @Optional() private intercom: Intercom,
  ) { }

  changeStatus(status: OfferStatus, id: string) {
    this.loading$.next(true);
    this.offerService.update(id, { status })
      .finally(() => this.loading$.next(false))
      .catch((err) => {
        console.error(err)
        this.snackbar.open(`There was an error, please try again later`, '', { duration: 4000 })
      })
  }

  openIntercom(): void {
    return this.intercom.show();
  }
}
