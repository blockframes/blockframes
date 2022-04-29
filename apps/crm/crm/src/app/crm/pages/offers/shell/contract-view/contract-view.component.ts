
import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { filter, map, pluck } from 'rxjs/operators';
import { combineLatest, Subscription } from 'rxjs';
import { IncomeService } from '@blockframes/contract/income/+state';
import { ContractService } from '@blockframes/contract/contract/+state';
import { ConfirmInputComponent } from '@blockframes/ui/confirm-input/confirm-input.component';
import { OfferShellComponent } from '../shell.component';
import { NegotiationService } from '@blockframes/contract/negotiation/+state/negotiation.service';
import { isInitial } from '@blockframes/contract/negotiation/utils';
import { Holdback, Negotiation, Term } from '@blockframes/model';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';


@Component({
  selector: 'contract-view',
  templateUrl: './contract-view.component.html',
  styleUrls: ['./contract-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractViewComponent implements OnInit, OnDestroy {

  offer$ = this.shell.offer$;
  contract$ = combineLatest([
    this.offer$,
    this.route.params.pipe(pluck('contractId')),
  ]).pipe(
    map(([offer, contractId]) => {
      const contracts = [...(offer.contracts ?? []), ...(offer.declinedContracts ?? [])];
      return contracts.find(contract => contract.id === contractId)
    }),
    filter(contract => !!contract),
  );

  form = new FormGroup({
    status: new FormControl('pending')
  });

  private sub: Subscription;

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private snackbar: MatSnackBar,
    private shell: OfferShellComponent,
    private incomeService: IncomeService,
    private negotiationService: NegotiationService,
    private contractService: ContractService,
  ) { }

  ngOnInit() {
    this.sub = this.contract$.subscribe(contract => {
      this.form.setValue({
        status: contract.negotiation.status
      });
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  async update(contractId: string, negotiationId: string) {
    const config = { params: { contractId } };
    const { status } = this.form.value;
    await this.negotiationService.update(negotiationId, { status }, config)
    this.snackbar.open('Offer updated!', 'ok', { duration: 1000 });
  }

  updateHoldbacks(contractId: string, holdbacks: Holdback[]) {
    this.contractService.update(contractId, { holdbacks });
  }

  confirm(term: Term) {
    this.dialog.open(ConfirmInputComponent, {
      data: createModalData({
        title: 'Are you sure ?',
        subtitle: `You are about to delete permanently this term (#${term.id}). This action will also update the contract #${term.contractId} to remove the reference to the deleted term.`,
        text: `Please type "DELETE" to confirm.`,
        confirmationWord: 'DELETE',
        confirmButtonText: 'Delete term',
        onConfirm: this.delete(term)
      }, 'medium')
    });
  }

  delete(term: Term) {
    this.contractService.update(term.contractId, (contract, write) => {
      this.incomeService.remove(term.id, { write });
      return { termIds: contract.termIds.filter(id => id !== term.id) };
    })
  }
}

@Pipe({ name: 'isNew' })
export class IsNegotiationNewPipe implements PipeTransform {
  transform(negotiation: Negotiation) {
    const pending = negotiation?.status === 'pending'
    if (isInitial(negotiation) && pending) return true;
    return false;
  }
}
