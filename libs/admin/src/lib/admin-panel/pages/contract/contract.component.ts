import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { ContractService } from '@blockframes/contract/contract/+state/contract.service';
import { ContractWithLastVersion, PublicContract } from '@blockframes/contract/contract/+state/contract.model';
import { ContractAdminForm } from '../../forms/contract-admin.form';
import { ContractVersionAdminForm } from '../../forms/contract-version-admin.form';
import { ContractStatus, ContractType } from '@blockframes/contract/contract/+state/contract.firestore';
import { ContractVersionService } from '@blockframes/contract/version/+state/contract-version.service';
import { getValue, termToPrettyDate } from '@blockframes/utils';
import { ContractVersion } from '@blockframes/contract/version/+state';
import { Observable } from 'rxjs/internal/Observable';
import { MovieCurrenciesSlug } from '@blockframes/utils/static-model/types';
import { getCodeBySlug } from '@blockframes/utils/static-model/staticModels';
import { MovieService } from '@blockframes/movie';


@Component({
  selector: 'admin-contract',
  templateUrl: './contract.component.html',
  styleUrls: ['./contract.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractComponent implements OnInit {
  public contractId = '';
  public contract: ContractWithLastVersion;
  public contractForm: ContractAdminForm;
  public contractVersionForm: ContractVersionAdminForm;
  public statuses: string[];
  public types: string[];
  public version: number;
  public publicContract$: Observable<PublicContract>;
  public toPrettyDate = termToPrettyDate;

  // Tables 
  public contractVersions: ContractVersion[] = [];
  public titles: any = [];
  public distributionDeals = [];

  // Table VERSION
  public versionColumnsTableVersions = {
    'id': 'Version',
    'status': 'Status',
    'creationDate': 'Creation date',
    'scope': 'Scope',
    'price': 'Price',
  };

  public initialColumnsTableVersions: string[] = [
    'id',
    'status',
    'creationDate',
    'scope',
    'price',
  ];


  // Table TITLES
  public versionColumnsTableTitles = {
    'id': 'Movie Id',
    'movie.main.internalRef': 'Internal Ref',
    'movie.promotionalElements.poster': 'Poster',
    'movie.main.title.original': 'Original title',
    'movie.main.productionYear': 'Production year',
    'price': 'Price',
    'movie.main.storeConfig.status': 'Status',
    'movie.main.storeConfig.storeType': 'Store type',
    'deals': 'Deals',
    'exploredeals': 'All deals for this title'
  };

  public initialColumnsTableTitles: string[] = [
    'id',
    'movie.main.internalRef',
    'movie.promotionalElements.poster',
    'movie.main.title.original',
    'movie.main.productionYear',
    'price',
    'movie.main.storeConfig.status',
    'movie.main.storeConfig.storeType',
    'deals',
    'exploredeals',
  ];

  // FILTERS
  filterPredicateTableTitles(data: any, filter) {
    const columnsToFilter = [
      'id',
      'movie.main.internalRef',
      'movie.promotionalElements.poster',
      'movie.main.title.original',
      'movie.main.productionYear',
      'price',
      'movie.main.storeConfig.status',
      'movie.main.storeConfig.storeType',
    ];
    const dataStr = columnsToFilter.map(c => getValue(data, c)).join();
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }

  filterPredicateTableVersions(data: any, filter) {
    const columnsToFilter = [
      'id',
    ];
    const dataStr = columnsToFilter.map(c => getValue(data, c)).join();
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }

  constructor(
    private movieService: MovieService,
    private contractService: ContractService,
    private contractVersionService: ContractVersionService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) { }

  async ngOnInit() {
    this.contractId = this.route.snapshot.paramMap.get('contractId');
    this.contract = await this.contractService.getContractWithLastVersion(this.contractId);
    this.contractForm = new ContractAdminForm(this.contract.doc);
    this.contractVersionForm = new ContractVersionAdminForm(this.contract.last);
    this.version = parseInt(this.contract.last.id, 10);
    this.publicContract$ = this.contractService.listenOnPublicContract(this.contractId);
    this.contractVersions = await this.contractVersionService.getContractVersions(this.contractId);

    this.statuses = Object.keys(ContractStatus);
    this.types = Object.keys(ContractType);

    this.cdRef.detectChanges();

    Object.keys(this.contract.last.titles).forEach(async id => {
      const title = this.contract.last.titles[id];
      const movie = await this.movieService.getValue(id);

      this.titles.push({
        id,
        price: title.price,
        movie,
        deals: title.distributionDealIds.map( d => {return { id: d, movie: id}}),
        exploredeals: `/c/o/admin/panel/deals/${id}`,
      });

      this.titles = [...this.titles];
    })
  }

  public async updateContract() {
    if (this.contractForm.invalid) {
      this.snackBar.open('Information not valid', 'close', { duration: 5000 });
      return;
    }

    const update = {
      type: this.contractForm.get('type').value,
    }

    await this.contractService.update(this.contractId, update);

    this.snackBar.open('Informations updated !', 'close', { duration: 5000 });
  }

  public async updateVersion() {
    if (this.contractVersionForm.invalid) {
      this.snackBar.open('Information not valid', 'close', { duration: 5000 });
      return;
    }

    const update = {
      ...this.contract.last,
      creationDate: new Date(),
      status: this.contractVersionForm.get('status').value,
    }

    const newVersionId = await this.contractVersionService.addContractVersion({ doc: this.contract.doc, last: update });
    this.version = parseInt(newVersionId, 10);
    this.contractVersions = await this.contractVersionService.getContractVersions(this.contractId);
    this.cdRef.detectChanges();

    this.snackBar.open('Informations updated !', 'close', { duration: 5000 });
  }

  /** Utils function to get currency code for currency pipe. */
  public getCurrencyCode(currency: MovieCurrenciesSlug) {
    return getCodeBySlug('MOVIE_CURRENCIES', currency);
  }

  public getDealPath(dealId: string, movieId: string) {
    return `/c/o/admin/panel/deal/${dealId}/m/${movieId}`;
  }
}
