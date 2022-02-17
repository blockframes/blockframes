
import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { appName, getCurrentApp } from '@blockframes/utils/apps';
import { Organization, OrganizationService } from '@blockframes/organization/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Sale, ContractService, Holdback } from '@blockframes/contract/contract/+state';
import { MovieService } from '@blockframes/movie/+state';
import { joinWith } from '@blockframes/utils/operators';
import { centralOrgId } from '@env';
import { of } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { IncomeService } from '@blockframes/contract/income/+state';
import { Term } from '@blockframes/contract/term/+state';
import { ConfirmInputComponent } from '@blockframes/ui/confirm-input/confirm-input.component';
import { Negotiation } from '@blockframes/contract/negotiation/+state/negotiation.firestore';
import { isInitial } from '@blockframes/contract/negotiation/utils';

function getFullName(seller: Organization) {
  return seller.denomination.full;
}

@Component({
  selector: 'contract-view',
  templateUrl: './contract-view.component.html',
  styleUrls: ['./contract-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractViewComponent implements OnInit, OnDestroy {
  public app = getCurrentApp(this.routerQuery);
  public appName = appName[this.app];
  public orgId = this.orgService.org.id;


  contract$ = this.route.params.pipe(map(r => r.saleId as string))
    .pipe(
      switchMap(saleId => {
        return this.contractService.valueChanges(saleId).pipe(
          joinWith({
            licensor: (sale: Sale) => {
              return this.orgService.valueChanges(this.getLicensorId(sale))
            },
            licensee: () => of('External'),
            title: (sale: Sale) => this.titleService.valueChanges(sale.titleId).pipe(map(title => title.title.international)),
            price: (sale: Sale) => this.incomeService.valueChanges(sale.id),
          }),
        )
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
    private incomeService: IncomeService,
    private contractService: ContractService,
    private routerQuery: RouterQuery,
    private orgService: OrganizationService,
    private titleService: MovieService,
    private dynTitle: DynamicTitleService,

  ) { }

  ngOnInit() {
    this.sub = this.contract$.subscribe(contract => {
      this.form.setValue({
        status: contract.status
      });
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  async update(contractId: string) {
    const { status } = this.form.value;
    await this.contractService.update(contractId, { status });
    this.snackbar.open('Offer updated!', 'ok', { duration: 1000 });
  }

  updateHoldbacks(contractId: string, holdbacks: Holdback[]) {
    this.contractService.update(contractId, { holdbacks });
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


  getLicensorId(sale: Sale) {
    return sale.stakeholders.find(
      orgId => ![centralOrgId.catalog, sale.buyerId].includes(orgId)
    ) ?? sale.sellerId;
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
