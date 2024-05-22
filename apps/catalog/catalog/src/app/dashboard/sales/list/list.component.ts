import { Component, ChangeDetectionStrategy, Optional, OnInit } from '@angular/core';
import { ContractService } from '@blockframes/contract/contract/service';
import { Intercom } from 'ng-intercom';
import { joinWith } from 'ngfire';
import { combineLatest, of, map, catchError } from 'rxjs';
import { MovieService } from '@blockframes/movie/service';
import { IncomeService, incomeQuery } from '@blockframes/contract/income/service';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { getSeller } from '@blockframes/contract/contract/utils';
import { deletedIdentifier, externalOrgIdentifier, Sale } from '@blockframes/model';
import { OrganizationService } from '@blockframes/organization/service';
import { orderBy, where } from 'firebase/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { supportEmails } from '@env';

function queryConstraints(orgId: string, options: { internal?: boolean }) {
  if (options.internal) {
    return [
      where('buyerId', '!=', ''),
      where('type', '==', 'sale'),
      orderBy('buyerId', 'desc'),
      where('stakeholders', 'array-contains', orgId),
      orderBy('_meta.createdAt', 'desc')
    ]
  }

  return [
    where('buyerId', '==', ''),
    where('type', '==', 'sale'),
    where('stakeholders', 'array-contains', orgId),
    orderBy('_meta.createdAt', 'desc')
  ]
}

const invalidTitleErrorMessage = `Some Offers are linked to invalid titles. Please contact ${supportEmails.catalog}.`;

@Component({
  selector: 'catalog-sale-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaleListComponent implements OnInit {
  private orgId = this.orgService.org.id;

  public internalSales$ = this.contractService.valueChanges(queryConstraints(this.orgId, { internal: true })).pipe(
    joinWith({
      licensor: (sale: Sale) => this.orgService.valueChanges(getSeller(sale)).pipe(map(org => org.name)),
      licensee: (sale: Sale) => this.orgService.valueChanges(sale.buyerId).pipe(map(org => org.name)),
      title: (sale: Sale) => this.titleService.valueChanges(sale.titleId).pipe(
        map(title => title.title.international),
        catchError(_ => {
          this.snackbar.open(invalidTitleErrorMessage, 'close', { duration: 5000 });
          return of(deletedIdentifier.title);
        })
      ),
      negotiation: (sale: Sale) => this.contractService.lastNegotiation(sale.id)
    }),
  );

  public externalSales$ = this.contractService.valueChanges(queryConstraints(this.orgId, { internal: false })).pipe(
    joinWith({
      licensor: (sale: Sale) => this.orgService.valueChanges(getSeller(sale)).pipe(map(org => org.name)),
      licensee: () => of(externalOrgIdentifier),
      title: (sale: Sale) => this.titleService.valueChanges(sale.titleId).pipe(
        map(title => title.title.international),
        catchError(_ => {
          this.snackbar.open(invalidTitleErrorMessage, 'close', { duration: 5000 });
          return of(deletedIdentifier.title);
        })
      ),
      incomes: (sale: Sale) => this.incomeService.valueChanges(incomeQuery(sale.id)),
    }),
  );

  public sales$ = combineLatest([this.internalSales$, this.externalSales$]);

  constructor(
    private contractService: ContractService,
    private orgService: OrganizationService,
    private titleService: MovieService,
    private incomeService: IncomeService,
    private dynTitle: DynamicTitleService,
    private snackbar: MatSnackBar,
    @Optional() private intercom: Intercom,
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('My Deals (All)');
  }

  public openIntercom() {
    return this.intercom.show();
  }
}
