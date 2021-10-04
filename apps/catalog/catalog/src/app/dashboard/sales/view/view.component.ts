import {
  Component, ChangeDetectionStrategy, Optional, OnInit, OnDestroy
} from '@angular/core';
import { ContractService, ContractStatus, contractStatus } from '@blockframes/contract/contract/+state';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map, pluck, shareReplay, switchMap } from 'rxjs/operators';
import { Intercom } from 'ng-intercom';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeclineComponent } from '@blockframes/contract/contract/components/confirm-decline/confirm-decline.component';
import { centralOrgId } from '@env';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'catalog-sale-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogSaleViewComponent implements OnInit, OnDestroy {

  contractId: string = this.route.snapshot.params.saleId;

  sale$ = this.contractService.valueChanges(this.contractId);

  contractStatus = contractStatus;

  isOnPlatformSale$ = this.sale$.pipe(
    map(sale => sale.sellerId === centralOrgId.catalog)
  )

  statusControl = new FormControl()
  sub: Subscription;

  constructor(
    private contractService: ContractService,
    private route: ActivatedRoute,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
    @Optional() private intercom: Intercom,
  ) { }

  ngOnInit() {
    this.sub = this.statusControl.valueChanges.subscribe(status => {
      this.changeStatus(status, this.contractId);
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  changeStatus(status: ContractStatus, id: string, declineReason?: string) {
    const data = declineReason ? { status, declineReason } : { status }
    this.contractService.update(id, data)
      .catch((err) => {
        console.error(err)
        this.snackbar.open(`There was an error, please try again later`, '', { duration: 4000 })
      })
  }

  declineContract(id: string) {
    const ref = this.dialog.open(ConfirmDeclineComponent)
    ref.afterClosed().subscribe((reason) => {
      if (typeof reason === 'string') this.changeStatus('declined', id, reason)
    })
  }

  openIntercom(): void {
    return this.intercom.show();
  }
}
