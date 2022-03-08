
import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { QueryFn } from "@angular/fire/firestore";

import { combineLatest, Subscription } from "rxjs";
import { map, throttleTime } from "rxjs/operators";

import { centralOrgId } from '@env';
import { joinWith } from "@blockframes/utils/operators";
import { Movie, MovieService } from "@blockframes/movie/+state/movie.service";
import { TermService } from "@blockframes/contract/term/+state";
import { ContractService } from "@blockframes/contract/contract/+state";
import { AvailsForm } from "@blockframes/contract/avails/form/avails.form";
import { Income, IncomeService } from "@blockframes/contract/income/+state";
import { decodeUrl, encodeUrl } from "@blockframes/utils/form/form-state-url-encoder";
import { DynamicTitleService } from "@blockframes/utils/dynamic-title/dynamic-title.service";
import { AvailsFilter, availableTitle, FullSale, FullMandate } from "@blockframes/contract/avails/avails";
import { OrganizationService } from "@blockframes/organization/+state";

interface TotalIncome { EUR: number; USD: number; }

type FullSaleWithIncome = FullSale & { income?: Income };

type JoinSaleTitleType = {
  sales?: FullSaleWithIncome[],
  mandates?: FullMandate[],
  id: string,
  saleCount?: number,
  totalIncome?: TotalIncome,
  allSaleCount?: number,
}

const titleQuery = (orgId: string): QueryFn => ref => ref.where('orgIds', 'array-contains', orgId).where('app.catalog.access', '==', true);
const mandateQuery = (title: Movie): QueryFn => ref => ref.where('titleId', '==', title.id)
  .where('type', '==', 'mandate')
  .where('status', '==', 'accepted');
const saleQuery = (title: Movie): QueryFn => ref => ref.where('titleId', '==', title.id)
  .where('type', '==', 'sale')
  .where('status', '==', 'accepted');


const isCatalogSale = (sale: FullSaleWithIncome): boolean => sale.sellerId === centralOrgId.catalog && sale.status === 'accepted';

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
  private orgId = this.orgService.org.id;
  private sub: Subscription;

  public queryParams$ = this.route.queryParamMap.pipe(
    map(query => ({ formValue: query.get('formValue') })),
  )

  private titles$ = this.titleService.valueChanges(titleQuery(this.orgId)).pipe(
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
    map(titles => titles.map(t => saleCountAndTotalPrice(t as JoinSaleTitleType))),
  );

  public results$ = combineLatest([
    this.titles$,
    this.availsForm.value$
  ]).pipe(
    map(([titles, avails]) => {
      if (this.availsForm.invalid) return titles;

      return titles.filter(title => {
        const availableMandates = availableTitle(avails, title.mandates, title.sales);
        return availableMandates.length;
      });
    }),
  );

  constructor(
    private titleService: MovieService,
    private dynTitleService: DynamicTitleService,
    private contractService: ContractService,
    private incomeService: IncomeService,
    private route: ActivatedRoute,
    private router: Router,
    private termsService: TermService,
    private orgService: OrganizationService,
  ) { }

  ngOnInit() {
    this.dynTitleService.setPageTitle('My Avails');
  }

  ngAfterViewInit() {
    const decodedData: Partial<AvailsFilter> = decodeUrl(this.route);
    if (!decodedData.territories) decodedData.territories = [];
    if (!decodedData.medias) decodedData.medias = [];
    if (decodedData.duration?.from) decodedData.duration.from = new Date(decodedData.duration.from);
    if (decodedData.duration?.to) decodedData.duration.to = new Date(decodedData.duration.to);
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

