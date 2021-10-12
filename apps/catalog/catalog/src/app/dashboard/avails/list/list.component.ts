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

type SaleWithIncomeAndTerms = (Sale<Date> | Mandate<Date>) & { income?: Income; terms?: Term<Date>[]; }

type JoinTitleType = {
  contracts?: SaleWithIncomeAndTerms[], id: string,
  saleCount?: number, totalIncome?: TotalIncome,
  allSaleCount?: number,
}

const contractsQuery = (title: Movie): QueryFn => ref => ref.where('titleId', '==', title.id);

const organizationQuery = (orgId: string): QueryFn => {
  return ref => ref.where('orgIds', 'array-contains', orgId);
}

const isCatalogSale = (contract: SaleWithIncomeAndTerms): boolean => contract.sellerId === centralOrgId.catalog && contract.status === 'accepted';
const isSale = (contract: SaleWithIncomeAndTerms): boolean => contract.type === 'sale' && contract.status === 'accepted';

const getSaleCountAndTotalPrice = (title: JoinTitleType) => {
  const initialTotal: TotalIncome = { EUR: 0, USD: 0 };
  if (!title.contracts) return title;
  title.saleCount = title.contracts.filter(isCatalogSale).length;
  title.allSaleCount = title.contracts.filter(isSale).length;
  title.totalIncome = title.contracts.filter(isSale).reduce((total, sale) => {
    if (sale.income) total[sale.income.currency] += sale.income.price
    return total;
  }, initialTotal);
  return title;
}


function isAcceptedSale(contract: Sale<Date> | Mandate<Date>) {
  return contract.status === 'accepted' && contract.type === 'sale';
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

  public query$ = this.titleService.valueChanges(organizationQuery(this.orgId)).pipe(
    joinWith({
      contracts: title => {
        return this.contractService.valueChanges(contractsQuery(title)).pipe(
          joinWith({
            income: contract => (isAcceptedSale(contract)) ? this.incomeService.valueChanges(contract.id) : null,
            terms: contract => this.termsService.valueChanges(contract.termIds),
          })
        )
      },
      saleCount: () => 0,
      allSaleCount: () => 0,
      totalIncome: () => ({ EUR: 0, USD: 0 }), // used for typings
    }, { debounceTime: 200 }),
    map(titles => titles.map(getSaleCountAndTotalPrice)),
  );

  public results$ = combineLatest([
    this.query$,
    this.availsForm.valueChanges
  ]).pipe(
    map(([titles, avails]) => titles.filter(title => {
      const mandateTerms = title.contracts?.filter(contract => contract.type === 'mandate' && contract.status === 'accepted').map(contract => contract.terms).flat();
      const saleTerms = title.contracts?.filter(contract => contract.type === 'sale' && contract.status === 'accepted').map(contract => contract.terms).flat();

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

