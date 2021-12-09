import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContractService, ContractStatus } from '@blockframes/contract/contract/+state';
import { MatDialog } from '@angular/material/dialog';
import { SaleShellComponent } from '../shell.component';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { ConfirmDeclineComponent } from '@blockframes/contract/contract/components/confirm-decline/confirm-decline.component';


@Component({
  selector: 'sale-external',
  templateUrl: './external.component.html',
  styleUrls: ['./external.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExternalSaleComponent {

  centralOrgId = this.shell.centralOrgId;
  sale$ = this.shell.sale$;
  contractStatus = this.shell.contractStatus;
  activeOrgId = this.query.getActiveId();


  constructor(
    private contractService: ContractService,
    private shell: SaleShellComponent,
    private dialog: MatDialog,
    private query: OrganizationQuery
  ) { }


  changeStatus(status: ContractStatus, id: string) {
    if (status === 'declined') {
      const ref = this.dialog.open(ConfirmDeclineComponent);
      ref.afterClosed().subscribe(declineReason => {
        if (typeof declineReason === 'string') this.contractService.update(id, { declineReason, status: 'declined' })
      });
    } else {
      this.contractService.update(id, { status });
    }
  }
}
