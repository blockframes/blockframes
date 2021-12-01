import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContractService, ContractStatus } from '@blockframes/contract/contract/+state';
import { MatDialog } from '@angular/material/dialog';
import { SaleShellComponent } from '../shell.component';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Movie } from '@blockframes/movie/+state';
import { ConfirmDeclineComponent } from '@blockframes/contract/contract/components/confirm-decline/confirm-decline.component';


@Component({
  selector: 'sale-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaleViewComponent {

  centralOrgId = this.shell.centralOrgId;
  sale$ = this.shell.sale$;
  contractStatus = this.shell.contractStatus;
  activeOrgId = this.query.getActiveId();


  constructor(
    private contractService: ContractService,
    private snackbar: MatSnackBar,
    private shell: SaleShellComponent,
    private dialog: MatDialog,
    private query: OrganizationQuery
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


  acceptContract(id: string, movie: Movie) {
    const data = {
      onConfirm: () => this.contractService.update(id, { status: 'accepted' }),
      title: 'Are you sure you want to accept this Contract?',
      question: 'Please verify if all the contract elements are convenient for you.',
      confirm: 'Yes, accept Contract',
      cancel: 'Come back & verify Contract',
    }
    const ref = this.dialog.open(ConfirmComponent, { data })
    ref.afterClosed().subscribe(acceptSuccessful => {
      if (acceptSuccessful)
        this.snackbar.open(`You accepted contract for ${movie.title.international}`)
    })
  }
}
