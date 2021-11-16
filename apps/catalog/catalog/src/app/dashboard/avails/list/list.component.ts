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
import { AvailsFilter, filterDashboardAvails } from "@blockframes/contract/avails/avails";
import { combineLatest, Subscription } from "rxjs";
import { Term, TermService } from "@blockframes/contract/term/+state";

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
  // @todo(#7139) remove default duration value once issue is solved
  public availsForm = new AvailsForm({ duration: { from: null, to: null } }, []);
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
        const mandateTerms = title?.mandates?.flatMap(contract => contract.terms) ?? [];
        const saleTerms = title.sales?.flatMap(contract => contract.terms) ?? [];
        // @todo(#7139) use better filter
        return filterDashboardAvails(mandateTerms, saleTerms, avails);
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

