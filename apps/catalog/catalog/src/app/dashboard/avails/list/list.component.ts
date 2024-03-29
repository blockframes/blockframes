import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QueryConstraint, where } from 'firebase/firestore';

import { combineLatest, Subscription } from 'rxjs';
import { map, throttleTime } from 'rxjs/operators';

import { centralOrgId } from '@env';
import { joinWith } from 'ngfire';
import { MovieService } from '@blockframes/movie/service';
import {
  Movie,
  Income,
  AvailsFilter,
  availableTitle,
  FullSale,
  FullMandate,
  decodeDate,
  PricePerCurrency,
  getTotalPerCurrency
} from '@blockframes/model';
import { TermService } from '@blockframes/contract/term/service';
import { ContractService } from '@blockframes/contract/contract/service';
import { AvailsForm } from '@blockframes/contract/avails/form/avails.form';
import { incomeQuery, IncomeService } from '@blockframes/contract/income/service';
import { decodeUrl, encodeUrl } from '@blockframes/utils/form/form-state-url-encoder';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { OrganizationService } from '@blockframes/organization/service';
import { DownloadSettings, PdfService } from '@blockframes/utils/pdf.service';
import { MatSnackBar } from '@angular/material/snack-bar';

type FullSaleWithIncome = FullSale & { incomes?: Income[] };

type JoinSaleTitleType = {
  sales?: FullSaleWithIncome[];
  mandates?: FullMandate[];
  id: string;
  saleCount?: number;
  totalIncome?: PricePerCurrency;
  allSaleCount?: number;
};

const titleQuery = (orgId: string): QueryConstraint[] => [
  where('orgIds', 'array-contains', orgId),
  where('app.catalog.access', '==', true)
];

const mandateQuery = (title: Movie): QueryConstraint[] => [
  where('titleId', '==', title.id),
  where('type', '==', 'mandate'),
  where('status', '==', 'accepted')
];

const saleQuery = (title: Movie): QueryConstraint[] => [
  where('titleId', '==', title.id),
  where('type', '==', 'sale'),
  where('status', '==', 'accepted')
];

const isCatalogSale = (sale: FullSaleWithIncome): boolean =>
  sale.sellerId === centralOrgId.catalog && sale.status === 'accepted';

const saleCountAndTotalPrice = (title: JoinSaleTitleType) => {
  if (!title.sales) return title;
  title.saleCount = title.sales.filter(isCatalogSale).length;
  title.allSaleCount = title.sales.length;
  title.totalIncome = getTotalPerCurrency(title.sales.map(s => s.incomes).flat());
  return title;
};

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
    map((query) => ({ formValue: query.get('formValue') }))
  );

  private titles$ = this.titleService.valueChanges(titleQuery(this.orgId)).pipe(
    joinWith(
      {
        sales: (title) => {
          return this.contractService.valueChanges(saleQuery(title)).pipe(
            joinWith(
              {
                incomes: (sale) => this.incomeService.valueChanges(incomeQuery(sale.id)),
                terms: (sale) => this.termsService.valueChanges(sale.termIds),
              },
              { shouldAwait: true }
            )
          );
        },
        mandates: (title) => {
          return this.contractService.valueChanges(mandateQuery(title)).pipe(
            joinWith(
              {
                terms: (mandate) => this.termsService.valueChanges(mandate.termIds),
              },
              { shouldAwait: true }
            )
          );
        },
        saleCount: () => 0,
        allSaleCount: () => 0,
        totalIncome: () => ({ EUR: 0, USD: 0 }), // used for typings
      },
      { shouldAwait: true }
    ),
    map((titles) => titles.map((t) => saleCountAndTotalPrice(t as JoinSaleTitleType)))
  );

  public results$ = combineLatest([this.titles$, this.availsForm.value$]).pipe(
    map(([titles, avails]) => {
      if (this.availsForm.invalid) return titles;

      return titles.filter((title) => {
        const availableMandates = availableTitle(avails, title.mandates, title.sales);
        return availableMandates.length;
      });
    })
  );

  exporting = false;

  constructor(
    private titleService: MovieService,
    private dynTitleService: DynamicTitleService,
    private contractService: ContractService,
    private incomeService: IncomeService,
    private route: ActivatedRoute,
    private router: Router,
    private termsService: TermService,
    private orgService: OrganizationService,
    private pdfService: PdfService,
    private snackbar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.dynTitleService.setPageTitle('My Avails');
  }

  ngAfterViewInit() {
    const decodedData: Partial<AvailsFilter> = decodeUrl(this.route);
    if (!decodedData.territories) decodedData.territories = [];
    if (!decodedData.medias) decodedData.medias = [];
    if (decodedData.duration?.from) decodedData.duration.from = decodeDate(decodedData.duration.from);
    if (decodedData.duration?.to) decodedData.duration.to = decodeDate(decodedData.duration.to);
    this.availsForm.patchValue(decodedData);
    this.sub = this.availsForm.valueChanges.pipe(throttleTime(1000)).subscribe((formState) => {
      encodeUrl<AvailsFilter>(this.router, this.route, formState as AvailsFilter);
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  goToMap(id: string) {
    this.router.navigate([id, 'map'], { relativeTo: this.route });
  }

  async export(movies: Movie[]) {
    const titleIds = movies.filter(m => m.app.catalog.status === 'accepted').map(m => m.id);

    const downloadSettings: DownloadSettings = { titleIds, orgId: this.orgService.org.id, filters: { avails: this.availsForm.value } };
    const canDownload = this.pdfService.canDownload(downloadSettings);

    if (!canDownload.status) {
      this.snackbar.open(canDownload.message, 'close', { duration: 5000 });
      return;
    }

    const snackbarRef = this.snackbar.open('Please wait, your export is being generated...');
    this.exporting = true;
    this.cdr.markForCheck();
    const exportStatus = await this.pdfService.download(downloadSettings);
    snackbarRef.dismiss();
    if (!exportStatus) {
      this.snackbar.open('The export you want has too many titles. Try to reduce your research.', 'close', { duration: 5000 });
    }
    this.exporting = false;
    this.cdr.markForCheck();
  }
}
