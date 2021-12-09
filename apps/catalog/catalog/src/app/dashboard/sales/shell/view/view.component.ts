import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContractService } from '@blockframes/contract/contract/+state';
import { MatDialog } from '@angular/material/dialog';
import { SaleShellComponent } from '../shell.component';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Movie } from '@blockframes/movie/+state';

@Component({
  selector: 'sale-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaleViewComponent {

  centralOrgId = this.shell.centralOrgId;
  sale$ = this.shell.sale$;
  orgId = this.query.getActiveId();

  constructor(
    private contractService: ContractService,
    private snackbar: MatSnackBar,
    private shell: SaleShellComponent,
    private dialog: MatDialog,
    private query: OrganizationQuery
  ) { }

  accept(id: string, movie: Movie) {
    const data = {
      onConfirm: () => this.contractService.update(id, { status: 'accepted' }),
      title: 'Are you sure you want to accept this Contract?',
      question: 'Please verify if all the contract elements are convenient for you.',
      confirm: 'Yes, accept Contract',
      cancel: 'Come back & verify Contract',
    };
    const ref = this.dialog.open(ConfirmComponent, { data });
    ref.afterClosed().subscribe(acceptSuccessful => {
      if (acceptSuccessful)
        this.snackbar.open(`You accepted contract for ${movie.title.international}`)
    });
  }
}
