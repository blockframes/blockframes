import {
  Component, ChangeDetectionStrategy, Optional
} from '@angular/core';
import { ContractService, ContractStatus, Sale } from '@blockframes/contract/contract/+state';
import { OfferService } from '@blockframes/contract/offer/+state';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { first, pluck, shareReplay, switchMap } from 'rxjs/operators';
import { Intercom } from 'ng-intercom';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeclineComponent } from '@blockframes/contract/contract/components/confirm-decline/confirm-decline.component';


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
    private dialog: MatDialog,
    @Optional() private intercom: Intercom,
  ) { }

  changeStatus(status: ContractStatus, id: string, declineReason?: string) {
    let data: Partial<Sale> = { status };
    if (declineReason) { data = { ...data, declineReason } }
    this.contractService.update(id, data)
      .catch((err) => {
        console.error(err)
        this.snackbar.open(`There was an error, please try again later`, '', { duration: 4000 })
      })
  }

  declineContract(id: string) {
    const dialogInstance = this.dialog.open(ConfirmDeclineComponent, { data: { contractId: id } })
    dialogInstance.afterClosed().pipe(first()).subscribe(
      declineReason => declineReason ? this.changeStatus('declined', id, declineReason) : {}
    )

  }

  openIntercom(): void {
    return this.intercom.show();
  }
}
