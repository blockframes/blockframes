import {
  Component, ChangeDetectionStrategy, Optional
} from '@angular/core';
import { ContractService, ContractStatus, contractStatus } from '@blockframes/contract/contract/+state';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { pluck, switchMap } from 'rxjs/operators';
import { Intercom } from 'ng-intercom';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeclineComponent } from '@blockframes/contract/contract/components/confirm-decline/confirm-decline.component';
import { centralOrgId } from '@env';


@Component({
  selector: 'catalog-sale-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogSaleViewComponent {

  centralOrgId = centralOrgId;
  sale$ = this.route.params.pipe(
    pluck('saleId'),
    switchMap((id: string) => this.contractService.valueChanges(id)),
  );
  contractStatus = contractStatus;


  constructor(
    private contractService: ContractService,
    private route: ActivatedRoute,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
    @Optional() private intercom: Intercom,
  ) { }


  changeStatus(status: ContractStatus, id: string) {
    if (status === 'declined') {
      const ref = this.dialog.open(ConfirmDeclineComponent)
      ref.afterClosed().subscribe(declineReason => {
        if (typeof declineReason === 'string') this.contractService.update(id, { declineReason, status: 'declined' })
      })
    } else {
      this.contractService.update(id, { status });
    }
  }

  openIntercom(): void {
    return this.intercom.show();
  }
}
