import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { UntypedFormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { joinWith } from 'ngfire';
import { of } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';

import { getSeller } from '@blockframes/contract/contract/utils'
import { OrganizationService } from '@blockframes/organization/service';
import { ContractService } from '@blockframes/contract/contract/service';
import { MovieService } from '@blockframes/movie/service';
import { IncomeService, incomeQuery } from '@blockframes/contract/income/service';
import { ConfirmInputComponent } from '@blockframes/ui/confirm-input/confirm-input.component';
import { Contract, Term, getTotalIncome } from '@blockframes/model';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { NavigationService } from '@blockframes/ui/navigation.service';
import { TermService } from '@blockframes/contract/term/service';

@Component({
  selector: 'contract-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractViewComponent {

  contract$ = this.route.params.pipe(
    switchMap(({ contractId }: { contractId: string }) => this.getContract(contractId)),
    filter(contract => !!contract),
    tap(contract => this.statusForm.setValue(contract.status))
  );

  statusForm = new UntypedFormControl('pending');

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private snackbar: MatSnackBar,
    private incomeService: IncomeService,
    private termService: TermService,
    private contractService: ContractService,
    private orgService: OrganizationService,
    private titleService: MovieService,
    private navService: NavigationService
  ) { }

  async update(contractId: string) {
    const status = this.statusForm.value;
    await this.contractService.update(contractId, { status });
    this.snackbar.open('Offer updated!', 'ok', { duration: 1000 });
  }

  private getContract(saleId: string) {
    return this.contractService.valueChanges(saleId).pipe(
      joinWith({
        licensor: (contract: Contract) => this.orgService.valueChanges(getSeller(contract)),
        licensee: () => of('External'),
        title: (contract: Contract) => this.titleService.valueChanges(contract.titleId).pipe(map(title => title.title.international)),
        totalIncome: (contract: Contract) => this.incomeService.valueChanges(incomeQuery(contract.id)).pipe(map(i => getTotalIncome(i)))
      })
    );
  }

  confirm(term: Term) {
    this.dialog.open(ConfirmInputComponent, {
      data: createModalData({
        title: 'Are you sure ?',
        subtitle: `You are about to delete permanently this term (#${term.id}). This action will also update the contract #${term.contractId} to remove the reference to the deleted term.`,
        text: `Please type "DELETE" to confirm.`,
        confirmationWord: 'DELETE',
        confirmButtonText: 'Delete term',
        onConfirm: () => this.delete(term)
      })
    });
  }

  private delete(term: Term) {
    this.contractService.update(term.contractId, (contract, write) => {
      this.termService.remove(term.id, { write });
      return { termIds: contract.termIds.filter(id => id !== term.id) };
    })
  }

  public goBack() {
    this.navService.goBack(1);
  }
}
