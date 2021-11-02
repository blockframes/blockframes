import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, OnInit } from "@angular/core";
import { QueryFn } from "@angular/fire/firestore";
import { AvailsForm } from "@blockframes/contract/avails/form/avails.form";
import { ContractService, Sale, Mandate } from "@blockframes/contract/contract/+state";
import { Income, IncomeService } from "@blockframes/contract/income/+state";
import { Movie, MovieService } from "@blockframes/movie/+state";
import { OrganizationQuery } from "@blockframes/organization/+state";
import { DynamicTitleService } from "@blockframes/utils/dynamic-title/dynamic-title.service";
import { joinWith } from "@blockframes/utils/operators";
import { map, throttleTime } from "rxjs/operators";
import { centralOrgId } from '@env';
import { decodeUrl, encodeUrl } from "@blockframes/utils/form/form-state-url-encoder";
import { ActivatedRoute, Router } from "@angular/router";
import { AvailsFilter, isMovieAvailable } from "@blockframes/contract/avails/avails";
import { combineLatest, Subscription } from "rxjs";
import { Term, TermService } from "@blockframes/contract/term/+state";

interface TotalIncome { EUR: number; USD: number; }

type ContractWithIncomeAndTerms = (Sale<Date> | Mandate<Date>) & { income?: Income; terms?: Term<Date>[]; }

type JoinSaleTitleType = {
  sales?: ContractWithIncomeAndTerms[], id: string,
  saleCount?: number, totalIncome?: TotalIncome,
  allSaleCount?: number,
}

/**
 * Reason why we are getting all the contracts and not only the sales is because we need the mandates to compute
 * mandate terms to be able to compute isMovieAvailable
 * @param title
 * @returns
 */
const mandateQuery = (title: Movie): QueryFn => ref => ref.where('titleId', '==', title.id).where('type', '==', 'mandate').where('status', '==', 'accepted');
const saleQuery = (title: Movie): QueryFn => ref => ref.where('titleId', '==', title.id).where('type', '==', 'sale')
  .where('status', '==', 'accepted');

const organizationQuery = (orgId: string): QueryFn => {
  return ref => ref.where('orgIds', 'array-contains', orgId);
}

const isCatalogSale = (contract: ContractWithIncomeAndTerms): boolean => contract.sellerId === centralOrgId.catalog && contract.status === 'accepted';

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
  public availsForm = new AvailsForm({}, []);
  private orgId = this.orgQuery.getActiveId();
  private sub: Subscription;

  public queryParams$ = this.route.queryParamMap.pipe(
    map(query => ({ formValue: query.get('formValue') })),
  )

  private saleQuery$ = this.titleService.valueChanges(organizationQuery(this.orgId)).pipe(
    joinWith({
      sales: title => {
        return this.contractService.valueChanges(saleQuery(title)).pipe(
          joinWith({
            income: sale => this.incomeService.valueChanges(sale.id),
            terms: sale => this.termsService.valueChanges(sale.termIds),
          }, { shouldAwait: true, })
        )
      },
      saleCount: () => 0,
      allSaleCount: () => 0,
      totalIncome: () => ({ EUR: 0, USD: 0 }), // used for typings
    }, { shouldAwait: true, }),
    map(titles => titles.map(saleCountAndTotalPrice)),
  );

  private mandateQuery$ = this.titleService.valueChanges(organizationQuery(this.orgId)).pipe(
    joinWith({
      mandates: title => {
        return this.contractService.valueChanges(mandateQuery(title)).pipe(
          joinWith({
            terms: sale => this.termsService.valueChanges(sale.termIds),
          }, { shouldAwait: true, })
        )
      },
    }, { shouldAwait: true, }),
  );

  public results$ = combineLatest([
    this.saleQuery$,
    this.mandateQuery$,
    this.availsForm.value$
  ]).pipe(
    map(([titlesWithSales, titlesWithMandates, avails]) => titlesWithSales.filter(title => {
      const mandateTitle = titlesWithMandates.find(aTitleWithMandate => aTitleWithMandate.id === title.id);
      const mandateTerms = mandateTitle?.mandates?.flatMap(contract => contract.terms);
      const saleTerms = title.sales?.flatMap(contract => contract.terms);

      return isMovieAvailable(title.id, avails, null, mandateTerms ?? [], saleTerms ?? [], 'optional');
    })),
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
      encodeUrl<AvailsFilter>(this.router, this.route, formState);
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  goToMap(id: string) {
    this.router.navigate([id, 'map'], { relativeTo: this.route })
  }

}

