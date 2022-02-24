import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { appName, getCurrentApp } from '@blockframes/utils/apps';
import { OrganizationService } from '@blockframes/organization/+state';
import { Sale, ContractService, Holdback } from '@blockframes/contract/contract/+state';
import { MovieService } from '@blockframes/movie/+state';
import { joinWith } from '@blockframes/utils/operators';
import { getSeller } from '@blockframes/contract/contract/+state/utils'
import { of } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { IncomeService } from '@blockframes/contract/income/+state';
import { Term } from '@blockframes/contract/term/+state';
import { ConfirmInputComponent } from '@blockframes/ui/confirm-input/confirm-input.component';

@Component({
  selector: 'contract-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractViewComponent {
  public app = getCurrentApp(this.route);
  public appName = appName[this.app];
  public orgId = this.orgService.org.id;


  contract$ = this.route.params.pipe(map(r => r.saleId as string))
    .pipe(
      switchMap(saleId => this.getSale(saleId)),
      filter(contract => !!contract),
      tap(contract => this.statusForm.setValue(contract.status))
    );

  statusForm = new FormControl('pending')

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private snackbar: MatSnackBar,
    private incomeService: IncomeService,
    private contractService: ContractService,
    private orgService: OrganizationService,
    private titleService: MovieService,

  ) { }

  async update(contractId: string) {
    const status = this.statusForm.value;
    await this.contractService.update(contractId, { status });
    this.snackbar.open('Offer updated!', 'ok', { duration: 1000 });
  }

  updateHoldbacks(contractId: string, holdbacks: Holdback[]) {
    this.contractService.update(contractId, { holdbacks });
  }

  getSale(saleId: string) {
    return this.contractService.valueChanges(saleId).pipe(
      joinWith({
        licensor: (sale: Sale) => this.orgService.valueChanges(getSeller(sale)),
        licensee: () => of('External'),
        title: (sale: Sale) => this.titleService.valueChanges(sale.titleId).pipe(map(title => title.title.international)),
        price: (sale: Sale) => this.incomeService.valueChanges(sale.id)
      })
    );
  }

  confirm(term: Term) {
    this.dialog.open(ConfirmInputComponent, {
      data: {
        title: 'Are you sure ?',
        subtitle: `You are about to delete permanently this term (#${term.id}). This action will also update the contract #${term.contractId} to remove the reference to the deleted term.`,
        text: `Please type "DELETE" to confirm.`,
        confirmationWord: 'DELETE',
        confirmButtonText: 'Delete term',
        onConfirm: this.delete(term),
      }
    });
  }

  delete(term: Term) {
    this.contractService.update(term.contractId, (contract, write) => {
      this.incomeService.remove(term.id, { write });
      return { termIds: contract.termIds.filter(id => id !== term.id) };
    })
  }
}
