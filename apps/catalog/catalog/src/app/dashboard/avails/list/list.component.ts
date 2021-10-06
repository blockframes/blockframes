import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, OnInit } from "@angular/core";
import { QueryFn } from "@angular/fire/firestore";
import { AvailsForm } from "@blockframes/contract/avails/form/avails.form";
import { ContractService } from "@blockframes/contract/contract/+state";
import { IncomeService } from "@blockframes/contract/income/+state";
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
import { TermService } from "@blockframes/contract/term/+state";

const salesQuery = (title: Movie): QueryFn => {
  return ref => ref.where('titleId', '==', title.id)//.where('type', '==', 'sale')
  //.where('status', '==', 'accepted');
}

const organizationQuery = (orgId: string): QueryFn => {
  return ref => ref.where('orgIds', 'array-contains', orgId)
}

const hydrateTitles = (titles) => titles.map(title => {
  const initialTotal = { euro: 0, usd: 0 };
  title.saleCount = title.contracts?.filter(
    contract => contract.sellerId === centralOrgId.catalog && contract.status === 'accepted'
  ).length;
  title.totalIncome = title.contracts?.filter(
    contract => contract.type === 'sale' && contract.status === 'accepted'
  ).reduce((total, sale) => {
    if (sale.income.currency === 'USD') {
      total.usd += sale.income.price
    } else {
      total.euro += sale.income.price
    }
    return total;
  }, initialTotal) ?? initialTotal;
  return title;
})

@Component({
  selector: 'catalog-avails-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogAvailsListComponent implements AfterViewInit, OnDestroy, OnInit {
  public availsForm = new AvailsForm({ territories: [] }, ['territories']);
  private orgId = this.orgQuery.getActiveId();
  private subs: Subscription[] = [];

  public query$ = this.titleService.valueChanges(organizationQuery(this.orgId)).pipe(
    joinWith({
      contracts: title => {
        return this.contractService.valueChanges(salesQuery(title)).pipe(
          joinWith({
            income: contract => this.incomeService.valueChanges(contract.id),
            terms: contract => this.termsService.valueChanges(contract.termIds),
          })
        )
      },
      saleCount: () => 0,
      totalIncome: () => ({ euro: 0, usd: 0 }), // used for typings
    }, { debounceTime: 200 }),
    map(hydrateTitles),
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

  goTo(section: string) {
    const formValue = this.route.snapshot.queryParams.formValue
    this.router.navigate([section], { relativeTo: this.route, queryParams: { formValue } })
  }

  ngAfterViewInit() {
    const decodedData = decodeUrl(this.route);
    this.availsForm.patchValue(decodedData);
    const subSearchUrl = this.availsForm.valueChanges.pipe(
      throttleTime(1000)
    ).subscribe(formState => {
      encodeUrl<AvailsFilter>(this.router, this.route, formState);
    });
    this.subs.push(subSearchUrl);
  }

  ngOnDestroy() { this.subs.forEach(sub => sub.unsubscribe()); }

  ngOnInit() {
    this.dynTitleService.setPageTitle('My Avails');
  }
}
