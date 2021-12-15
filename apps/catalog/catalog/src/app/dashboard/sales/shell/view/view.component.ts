import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SaleShellComponent } from '../shell.component';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Movie } from '@blockframes/movie/+state';
import { NegotiationService } from '@blockframes/contract/negotiation/+state/negotiation.service';

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
    private negotiationService: NegotiationService,
    private snackbar: MatSnackBar,
    private shell: SaleShellComponent,
    private dialog: MatDialog,
    private query: OrganizationQuery
  ) { }

  accept(negotiationId: string, contractId: string, movie: Movie) {
    const status = 'accepted';
    const options = { params: { contractId } };
    const data = {
      onConfirm: () => this.negotiationService.update(negotiationId, { status }, options),
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
