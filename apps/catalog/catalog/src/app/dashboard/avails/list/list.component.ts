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

const contractsQuery = (title: Movie): QueryFn => ref => ref.where('titleId', '==', title.id)
  .where('status', '==', 'accepted').where('type', '==', 'sale');

const organizationQuery = (orgId: string): QueryFn => {
  return ref => ref.where('orgIds', 'array-contains', orgId);
}
type SaleWithIncomeAndTerms = (Sale<Date> | Mandate<Date>) & { income?: Income; terms?: Term<Date>[]; }

type JoinTitleType = {
  sales?: SaleWithIncomeAndTerms[], id: string,
  saleCount?: number, totalIncome?: TotalIncome
}

const getSaleCountAndTotalPrice = (title: JoinTitleType) => {
  const initialTotal = { EUR: 0, USD: 0 };
  title.saleCount = title.sales?.filter(
    sale => sale.sellerId === centralOrgId.catalog
  ).length;
  title.totalIncome = title.sales?.reduce((total, sale) => {
    if (sale.income && sale.income.currency === 'USD') {
      total.USD += sale.income.price
    } else if (sale.income) {
      total.EUR += sale.income.price
    }
    return total;
  }, initialTotal) ?? initialTotal;
  return title;
}

function isAcceptedSale(contract: Sale<Date> | Mandate<Date>) {
  return contract.status === 'accepted';
}


@Component({
  selector: 'catalog-avails-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogAvailsListComponent implements AfterViewInit, OnDestroy, OnInit {
  public availsForm = new AvailsForm({ territories: [] }, ['territories']);
  private orgId = this.orgQuery.getActiveId();
  private sub: Subscription;

  public queryParams$ = this.route.queryParamMap.pipe(
    map(query => ({ formValue: query.get('formValue') })),
  )

  public query$ = this.titleService.valueChanges(organizationQuery(this.orgId)).pipe(
    joinWith({
      sales: title => {
        return this.contractService.valueChanges(contractsQuery(title)).pipe(
          joinWith({
            income: contract => this.incomeService.valueChanges(contract.id),
            terms: contract => this.termsService.valueChanges(contract.termIds),
          })
        )
      },
      saleCount: () => 0,
      totalIncome: () => ({ EUR: 0, USD: 0 }), // used for typings
    }, { debounceTime: 200 }),
    map(titles => titles.map(getSaleCountAndTotalPrice)),
  );
  public results$ = combineLatest([
    this.query$,
    this.availsForm.valueChanges
  ]).pipe(
    map(([titles, avails]) => titles.filter(title => {
      const saleTerms = title.sales?.map(sale => sale.terms).flat();

      return isMovieAvailable(title.id, avails, null, [], saleTerms ?? [], 'optional');
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
    const decodedData = decodeUrl(this.route);
    this.availsForm.patchValue(decodedData);
    const subSearchUrl = this.availsForm.valueChanges.pipe(
      throttleTime(1000)
    ).subscribe(formState => {
      encodeUrl<AvailsFilter>(this.router, this.route, formState);
    });
    this.sub = subSearchUrl;
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}

