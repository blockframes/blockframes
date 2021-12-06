import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OfferShellComponent } from '../shell.component';
import { combineLatest } from 'rxjs';
import { first, map, pluck } from 'rxjs/operators';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { NegotiationService } from '@blockframes/contract/negotiation/+state/negotiation.service';
import { MovieService } from '@blockframes/movie/+state';

@Component({
  selector: 'catalog-contract-view',
  templateUrl: './contract-view.component.html',
  styleUrls: ['./contract-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractViewComponent {
  activeOrgId = this.orgQuery.getActiveId();

  contract$ = combineLatest([
    this.shell.offer$,
    this.route.params.pipe(pluck('contractId'))
  ]).pipe(
    map(([offer, id]) => offer.contracts?.find(contract => contract.id === id)),
  );

  constructor(
    private route: ActivatedRoute,
    private shell: OfferShellComponent,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private orgQuery: OrganizationQuery,
    private negotiationService: NegotiationService,
    private movieService: MovieService,
  ) { }



  async confirm() {
    const onConfirm = async () => {
      const sale = await this.contract$.pipe(first()).toPromise();
      this.negotiationService.update(
        sale.negotiation.id, { status: 'accepted' }, { params: { contractId: sale.id } }
      )
      this.snackBar.open(`You accepted contract for ${sale.title.title.international}`);
    }

    this.dialog.open(
      ConfirmComponent,
      {
        data: {
          onConfirm,
          title: 'Are you sure to accept this contract?',
          question: 'Please verify if all the contract elements are convenient for you.',
          confirm: 'Yes, accept contract',
          cancel: 'Come back & verify contract'
        }
      });
  }

}
