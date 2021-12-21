
import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { QueryFn } from "@angular/fire/firestore";

import { combineLatest, Subscription } from "rxjs";
import { map, throttleTime } from "rxjs/operators";

import { centralOrgId } from '@env';
import { joinWith } from "@blockframes/utils/operators";
import { Movie, MovieService } from "@blockframes/movie/+state";
import { OrganizationQuery } from "@blockframes/organization/+state";
import { Term, TermService } from "@blockframes/contract/term/+state";
import { AvailsForm } from "@blockframes/contract/avails/form/avails.form";
import { Income, IncomeService } from "@blockframes/contract/income/+state";
import { decodeUrl, encodeUrl } from "@blockframes/utils/form/form-state-url-encoder";
import { ContractService, Sale, Mandate } from "@blockframes/contract/contract/+state";
import { DynamicTitleService } from "@blockframes/utils/dynamic-title/dynamic-title.service";
import { AvailsFilter, availableTitle, FullSale, FullMandate } from "@blockframes/contract/avails/new-avails";

interface TotalIncome { EUR: number; USD: number; }

type SaleWithIncomeAndTerms = (Mandate<Date> | Sale<Date>) & { income?: Income; terms?: Term<Date>[]; }
type MandateWithTerms = (Mandate<Date> | Sale<Date>) & { terms?: Term<Date>[]; }

type JoinSaleTitleType = {
  sales?: SaleWithIncomeAndTerms[],
  mandates?: MandateWithTerms[],
  id: string,
  saleCount?: number,
  totalIncome?: TotalIncome,
  allSaleCount?: number,
}

const organizationQuery = (orgId: string): QueryFn => ref => ref.where('orgIds', 'array-contains', orgId);
// We need the mandates to compute isMovieAvailable
const mandateQuery = (title: Movie): QueryFn => ref => ref.where('titleId', '==', title.id)
  .where('type', '==', 'mandate')
  .where('status', '==', 'accepted');
const saleQuery = (title: Movie): QueryFn => ref => ref.where('titleId', '==', title.id)
  .where('type', '==', 'sale')
  .where('status', '==', 'accepted');


const isCatalogSale = (contract: SaleWithIncomeAndTerms): boolean => contract.sellerId === centralOrgId.catalog && contract.status === 'accepted';

const saleCountAndTotalPrice = (title: JoinSaleTitleType) => {
  const initialTotal: TotalIncome = { EUR: 0, USD: 0 };
  if (!title.sales) return title;
  title.saleCount = title.sales.filter(isCatalogSale).length;
  title.allSaleCount = title.sales.length;
  title.totalIncome = title.sales.reduce((total, sale) => {
    if (sale.income) total[sale.income.currency] += sale.income.price
    return total;
  }, initialTotal);
  return title;
}

@Component({
  selector: 'catalog-avails-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogAvailsListComponent implements AfterViewInit, OnDestroy, OnInit {
  public availsForm = new AvailsForm();
  private orgId = this.orgQuery.getActiveId();
  private sub: Subscription;

  public queryParams$ = this.route.queryParamMap.pipe(
    map(query => ({ formValue: query.get('formValue') })),
  )

  private titles$ = this.titleService.valueChanges(organizationQuery(this.orgId)).pipe(
    joinWith({
      sales: title => {
        return this.contractService.valueChanges(saleQuery(title)).pipe(
          joinWith({
            income: sale => this.incomeService.valueChanges(sale.id),
            terms: sale => this.termsService.valueChanges(sale.termIds),
          }, { shouldAwait: true, })
        )
      },
      mandates: title => {
        return this.contractService.valueChanges(mandateQuery(title)).pipe(
          joinWith({
            terms: mandate => this.termsService.valueChanges(mandate.termIds),
          }, { shouldAwait: true, })
        )
      },
      saleCount: () => 0,
      allSaleCount: () => 0,
      totalIncome: () => ({ EUR: 0, USD: 0 }), // used for typings
    }, { shouldAwait: true, }),
    map(titles => titles.map(saleCountAndTotalPrice)),
  );

  public results$ = combineLatest([
    this.titles$,
    this.availsForm.value$
  ]).pipe(
    map(([titles, avails]) => {
      return titles.filter(title => {
        if (this.availsForm.invalid) return true;
        return availableTitle(avails as AvailsFilter, title.mandates as FullMandate[], title.sales as FullSale[]);
      })
    }),
  );

  constructor(
    private titleService: MovieService,
    private dynTitleService: DynamicTitleService,
    private contractService: ContractService,
    private incomeService: IncomeService,
    private orgQuery: OrganizationQuery,
    private route: ActivatedRoute,
    private router: Router,
    private termsService: TermService,
  ) { }

  ngOnInit() {
    this.dynTitleService.setPageTitle('My Avails');
  }

  ngAfterViewInit() {
    const decodedData: { territories?: string[], medias?: string[] } = decodeUrl(this.route);
    if (!decodedData.territories) decodedData.territories = [];
    if (!decodedData.medias) decodedData.medias = [];
    this.availsForm.patchValue(decodedData);
    this.sub = this.availsForm.valueChanges.pipe(
      throttleTime(1000)
    ).subscribe(formState => {
      encodeUrl<AvailsFilter>(this.router, this.route, formState as AvailsFilter);
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  goToMap(id: string) {
    this.router.navigate([id, 'map'], { relativeTo: this.route })
  }

}

