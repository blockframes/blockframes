import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContractService } from '@blockframes/contract/contract/+state';
import { MatDialog } from '@angular/material/dialog';
import { SaleShellComponent } from '../shell.component';
import { OrganizationService } from '@blockframes/organization/+state';
import { ConfirmDeclineComponent, ConfirmDeclineData } from '@blockframes/contract/contract/components/confirm-decline/confirm-decline.component';
import { ContractStatus } from '@blockframes/model';


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
  activeOrgId = this.orgService.org.id;


  constructor(
    private contractService: ContractService,
    private shell: SaleShellComponent,
    private dialog: MatDialog,
    private orgService: OrganizationService,
  ) { }


  changeStatus(status: ContractStatus, id: string) {
    if (status === 'declined') {
      const data: ConfirmDeclineData = { type: 'seller' };
      const ref = this.dialog.open(ConfirmDeclineComponent, { data });
      ref.afterClosed().subscribe(declineReason => {
        const update = { declineReason, status: 'declined' } as const;
        if (typeof declineReason === 'string') this.contractService.update(id, update)
      });
    } else {
      this.contractService.update(id, { status });
    }
  }
}
