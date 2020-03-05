import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ContractService } from '@blockframes/contract/contract/+state/contract.service';
import { ContractWithLastVersion, PublicContract, createContractPartyDetail, Contract, ContractPartyDetail, createContractTitleDetail } from '@blockframes/contract/contract/+state/contract.model';
import { ContractAdminForm } from '../../forms/contract-admin.form';
import { ContractVersionAdminForm } from '../../forms/contract-version-admin.form';
import { contractStatus, contractType, ContractTitleDetail } from '@blockframes/contract/contract/+state/contract.firestore';
import { ContractVersionService } from '@blockframes/contract/version/+state/contract-version.service';
import { getValue } from '@blockframes/utils';
import { ContractVersion } from '@blockframes/contract/version/+state';
import { Observable } from 'rxjs/internal/Observable';
import { MovieCurrenciesSlug } from '@blockframes/utils/static-model/types';
import { getCodeBySlug } from '@blockframes/utils/static-model/staticModels';
import { MovieService } from '@blockframes/movie';
import { EditPartyComponent } from '../../components/edit-party/edit-party.component';
import { EditTitleComponent } from '../../components/edit-title/edit-title.component';

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
  public contractStatus = contractStatus;
  public contractType = contractType;
  public version: number;
  public publicContract$: Observable<PublicContract>;

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
    'exploredeals': 'All deals for this title',
    'edit': 'Edit',
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
    'edit',
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
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
  }

  async ngOnInit() {
    this.route.params.subscribe(async params => {
      this.contractId = params.contractId;
      this.contract = await this.contractService.getContractWithLastVersion(this.contractId);
      this.contractForm = new ContractAdminForm(this.contract.doc);
      this.contractVersionForm = new ContractVersionAdminForm(this.contract.last);
      this.version = parseInt(this.contract.last.id, 10);
      this.publicContract$ = this.contractService.listenOnPublicContract(this.contractId);
      this.contractVersions = await this.contractVersionService.getContractVersions(this.contractId);

      this.loadTitles();
      this.cdRef.markForCheck();

    });
  }

  private loadTitles() {
    this.titles = [];
    Object.keys(this.contract.last.titles).forEach(async id => {
      const title = this.contract.last.titles[id];
      const movie = await this.movieService.getValue(id);

      // Append new data for table display
      this.titles.push({
        id,
        price: title.price,
        movie,
        deals: title.distributionDealIds ? title.distributionDealIds.map(d => ({ id: d, movie: id })) : [],
        exploredeals: `/c/o/admin/panel/deals/${id}`,
        edit: id,
      });

      this.titles = [...this.titles];
    })
  }

  private async reloadContractAndVersions(newVersionId: string, reloadTitles = false) {
    this.version = parseInt(newVersionId, 10);
    this.contractVersions = await this.contractVersionService.getContractVersions(this.contractId);
    this.contract = await this.contractService.getContractWithLastVersion(this.contractId);

    if(reloadTitles){
      this.loadTitles();
    }
  
    this.cdRef.markForCheck();
  }

  /**
   * Update contract document
   */
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

  /**
   * Create a new contract version
   */
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

    // @TODO (#1887)
    const newVersionId = await this.contractVersionService.addContractVersion({ doc: this.contract.doc, last: update });
    this.version = parseInt(newVersionId, 10);
    this.contractVersions = await this.contractVersionService.getContractVersions(this.contractId);
    this.cdRef.detectChanges();

    this.snackBar.open('Informations updated !', 'close', { duration: 5000 });
  }

  public editParty(index: number) {
    const dialogRef = this.dialog.open(EditPartyComponent, {
      data: {
        title: 'Edit contract party.',
        subtitle: 'If you leave now, your changes will not be saved.',
        party: this.contract.doc.parties[index]
      },
      disableClose: true
    });

    return dialogRef.afterClosed().subscribe((output: ContractPartyDetail | { remove: boolean }) => this.updateParty(index, output));
  }

  public addParty() {
    const party = createContractPartyDetail();
    const index = this.contract.doc.parties.length;
    const dialogRef = this.dialog.open(EditPartyComponent, {
      data: {
        title: 'Add a contract party.',
        subtitle: 'If you leave now, your changes will not be saved.',
        party
      },
      disableClose: true
    });
    return dialogRef.afterClosed().subscribe((output: ContractPartyDetail | { remove: boolean }) => this.updateParty(index, output));
  }

  private async updateParty(index: number, output: ContractPartyDetail | { remove: boolean }): Promise<boolean> {
    if (!output) return false;
    const writeableContract = { ... this.contract.doc }

    if ((output as { remove: boolean }).remove === true) {
      writeableContract.parties.splice(index, 1);
    } else {
      output = output as ContractPartyDetail;
      // Hack because we actually need a multiselect form input
      if (output.childRoles && !Array.isArray(output.childRoles)) {
        output.childRoles = [output.childRoles];
      }
      writeableContract.parties[index] = output;
    }

    writeableContract.partyIds = this.contract.doc.parties.filter(p => p.party.orgId).map(p => p.party.orgId);

    this.contract.doc = writeableContract;
    await this.contractService.update(this.contract.doc);
    this.cdRef.markForCheck();
    this.snackBar.open('Informations updated !', 'close', { duration: 5000 });
    return true;
  }

  public addTitle() {
    const titleDetail = createContractTitleDetail();
    const dialogRef = this.dialog.open(EditTitleComponent, {
      data: {
        title: 'Add a contract title.',
        subtitle: 'If you leave now, your changes will not be saved.',
        titleDetail
      },
      disableClose: true
    });
    return dialogRef.afterClosed().subscribe((output: ContractTitleDetail | { remove: boolean }) => this.updateTitle(output));
  }

  public editTitle(titleId: string) {
    const dialogRef = this.dialog.open(EditTitleComponent, {
      data: {
        title: 'Edit a contract title.',
        titleId,
        subtitle: 'If you leave now, your changes will not be saved.',
        titleDetail: this.contract.last.titles[titleId]
      },
      disableClose: true
    });
    return dialogRef.afterClosed().subscribe((output: ContractTitleDetail | { remove: boolean }) => this.updateTitle(output, titleId));
  }

  private async updateTitle(output: ContractTitleDetail | { remove: boolean }, titleId?: string, ): Promise<boolean> {
    if (!output) return false;

    const writeableVersion = { ...this.contract.last };
    const writeableContract = { ... this.contract.doc }

    if ((output as { remove: boolean }).remove === true && titleId) {
      delete writeableVersion.titles[titleId];
      // @todo TEST
      // should also update distribution deal ? contractId etc
    } else {
      output = output as ContractTitleDetail;
      const titleId = output.titleId.trim();
      writeableVersion.titles[titleId] = output;
      const movie = await this.movieService.getValue(titleId);
      if(!movie){
        this.snackBar.open(`Title "${titleId}" not found.`, 'close', { duration: 5000 });
        return false;
      }
    }
    
    // A title have been updated, added or removed. Need to re-calculate contract price.
    this.calculatePrice(writeableVersion);

    // Udpate titleIds array
    writeableContract.titleIds = Object.keys(writeableVersion.titles);

    // @TODO (#1887)
    // Update contract and create a new version
    await this.contractService.update(writeableContract);
    const newVersionId = await this.contractVersionService.addContractVersion({ doc: this.contract.doc, last: writeableVersion });
    await this.reloadContractAndVersions(newVersionId, true);

    this.snackBar.open('Informations updated !', 'close', { duration: 5000 });
    return true;
  }

  /** Utils function to get currency code for currency pipe. */
  public getCurrencyCode(currency: MovieCurrenciesSlug) {
    return getCodeBySlug('MOVIE_CURRENCIES', currency);
  }

  public getDealPath(dealId: string, movieId: string) {
    return `/c/o/admin/panel/deal/${dealId}/m/${movieId}`;
  }

  public getContractTunnelPath(contract: Contract) {
    return `/c/o/marketplace/tunnel/contract/${contract.id}/${contract.type}`;
  }

  /**
   * @dev this method uses titles.price to update global contract price
   */
  public async updatePrice() {
    const update = this.calculatePrice({ ...this.contract.last });

    // @TODO (#1887)
    const newVersionId = await this.contractVersionService.addContractVersion({ doc: this.contract.doc, last: update });
    await this.reloadContractAndVersions(newVersionId);

    this.snackBar.open('Contract global price updated !', 'close', { duration: 5000 });
  }

  private calculatePrice(version :ContractVersion) {
    version.price.amount = 0;
    for (const titleId in version.titles) {
      version.price.amount += version.titles[titleId].price.amount;
    }
    return version;
  }
}
