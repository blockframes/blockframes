import {
  Component, ChangeDetectionStrategy, Optional
} from '@angular/core';
import { ContractService, ContractStatus } from '@blockframes/contract/contract/+state';
import { OfferService } from '@blockframes/contract/offer/+state';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { pluck, shareReplay, switchMap } from 'rxjs/operators';
import { Intercom } from 'ng-intercom';


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
    switchMap((id: string) => this.contractService.valueChanges(id)),
    shareReplay({ bufferSize: 1, refCount: true }),
  );


  constructor(
    private offerService: OfferService,
    private contractService: ContractService,
    private route: ActivatedRoute,
    private snackbar: MatSnackBar,
    @Optional() private intercom: Intercom,
  ) { }

  changeStatus(status: ContractStatus, id: string) {
    this.contractService.update(id, { status })
      .catch((err) => {
        console.error(err)
        this.snackbar.open(`There was an error, please try again later`, '', { duration: 4000 })
      })
  }

  openIntercom(): void {
    return this.intercom.show();
  }
}
