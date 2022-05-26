import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SaleShellComponent } from '../shell.component';
import { OrganizationService } from '@blockframes/organization/service';
import { ConfirmWithValidationComponent } from '@blockframes/contract/contract/components/confirm-with-validation/confirm-with-validation.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Movie } from '@blockframes/model';
import { NegotiationService } from '@blockframes/contract/negotiation/+state/negotiation.service';
import { AuthService } from '@blockframes/auth/service';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';

@Component({
  selector: 'sale-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaleViewComponent {
  centralOrgId = this.shell.centralOrgId;
  sale$ = this.shell.sale$;
  orgId = this.orgService.org.id;
  user$ = this.authService.profile$;

  constructor(
    private negotiationService: NegotiationService,
    private snackbar: MatSnackBar,
    private shell: SaleShellComponent,
    private dialog: MatDialog,
    private orgService: OrganizationService,
    private authService: AuthService,
  ) {}

  accept(negotiationId: string, contractId: string, title: Movie) {
    const status = 'accepted';
    const options = { params: { contractId } };
    const ref = this.dialog.open(ConfirmWithValidationComponent, {
      data: createModalData({
        onConfirm: () => this.negotiationService.update(negotiationId, { status }, options),
        title: 'Are you sure you want to accept this Contract?',
        question: 'Please verify if all the contract elements are convenient for you.',
        confirm: 'Yes, accept Contract',
        cancel: 'Come back & verify Contract'
      }),
      autoFocus: false
    });
    ref.afterClosed().subscribe((acceptSuccessful) => {
      const config = { duration: 6000 };
      if (acceptSuccessful)
        this.snackbar.open(`You accepted contract for ${title.title.international}`, null, config);
    });
  }
}
