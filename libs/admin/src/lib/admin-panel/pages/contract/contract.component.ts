import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ContractService } from '@blockframes/contract/contract/+state/contract.service';
import { PublicContract, createContractPartyDetail, Contract, ContractPartyDetail, createContractTitleDetail } from '@blockframes/contract/contract/+state/contract.model';
import { ContractAdminForm } from '../../forms/contract-admin.form';
import { ContractVersionAdminForm } from '../../forms/contract-version-admin.form';
import { ContractTitleDetail } from '@blockframes/contract/contract/+state/contract.firestore';
import { ContractVersionService } from '@blockframes/contract/version/+state/contract-version.service';
import { ContractVersion } from '@blockframes/contract/version/+state';
import { Observable } from 'rxjs/internal/Observable';
import { staticConsts } from '@blockframes/utils/static-model';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { EditPartyComponent } from '../../components/edit-party/edit-party.component';
import { EditTitleComponent } from '../../components/edit-title/edit-title.component';
import { calculatePrice } from '@blockframes/contract/contract/+state/contract.utils';
import { map } from 'rxjs/operators';
import { getValue } from '@blockframes/utils/helpers';

@Component({
  selector: 'admin-contract',
  templateUrl: './contract.component.html',
  styleUrls: ['./contract.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractComponent implements OnInit {
  public contractId = '';
  private contract: Contract;
  public contract$: Observable<Contract>;
  public contractForm: ContractAdminForm;
  public contractVersionForm: ContractVersionAdminForm;
  public contractStatus = staticConsts.contractStatus;
  public contractType = staticConsts.contractType;
  public publicContract$: Observable<PublicContract>;

  // Tables
  public contractVersions$: Observable<ContractVersion[]>;
  public titles: any = [];
  public distributionRights = [];

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
    'movie.internalRef': 'Internal Ref',
    'movie.poster': 'Poster',
    'movie.title.original': 'Original title',
    'movie.releaseYear': 'Release year',
    'price': 'Price',
    'movie.storeConfig.status': 'Status',
    'movie.storeConfig.storeType': 'Store type',
    'rights': 'rights',
    'explorerights': 'All rights for this title',
    'edit': 'Edit',
  };

  public initialColumnsTableTitles: string[] = [
    'id',
    'movie.internalRef',
    'movie.poster',
    'movie.title.original',
    'movie.releaseYear',
    'price',
    'movie.storeConfig.status',
    'movie.storeConfig.storeType',
    'rights',
    'explorerights',
    'edit',
  ];

  // FILTERS
  filterPredicateTableTitles(data: any, filter) {
    const columnsToFilter = [
      'id',
      'movie.internalRef',
      'movie.poster',
      'movie.title.original',
      'movie.releaseYear',
      'price',
      'movie.storeConfig.status',
      'movie.storeConfig.storeType',
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

  ngOnInit() {
    this.route.params.subscribe(async params => {
      this.contractId = params.contractId;
      this.publicContract$ = this.contractService.listenOnPublicContract(this.contractId);

      this.contract$ = this.contractService.listenOnContract(this.contractId).pipe(map(c => {
        this.contract = c;
        this.contractForm = new ContractAdminForm(this.contract);
        this.contractVersionForm = new ContractVersionAdminForm(this.contract.lastVersion);
        this.cdRef.markForCheck();
        this.titles = [];
        if (c.titleIds && c.lastVersion.titles) {
          c.titleIds.forEach(async titleId => {
            const movie = await this.movieService.getValue(titleId);
            if (c.lastVersion.titles[titleId]) {
              this.titles.push({
                titleId,
                price: c.lastVersion.titles[titleId].price,
                movie,
                rights: c.lastVersion.titles[titleId].distributionRightIds ? c.lastVersion.titles[titleId].distributionRightIds.map(d => ({ id: d, movie: titleId })) : [],
                explorerights: `/c/o/admin/panel/rights/${titleId}`,
                edit: titleId,
              });
              this.titles = [...this.titles];
            }
          });
        }
        return c;
      }));
      this.contractVersions$ = this.contractVersionService.listenOnContractVersions(this.contractId);
      this.cdRef.markForCheck();
    });
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

    this.contract.lastVersion.creationDate = new Date();
    this.contract.lastVersion.status = this.contractVersionForm.get('status').value;
    await this.contractService.update(this.contract);

    this.snackBar.open('Informations updated !', 'close', { duration: 5000 });
  }

  public editParty(index: number) {
    const dialogRef = this.dialog.open(EditPartyComponent, {
      data: {
        title: 'Edit contract party.',
        subtitle: 'If you leave now, your changes will not be saved.',
        party: this.contract.parties[index]
      },
      disableClose: true
    });

    return dialogRef.afterClosed().subscribe((output: ContractPartyDetail | { remove: boolean }) => this.updateParty(index, output));
  }

  public addParty() {
    const party = createContractPartyDetail();
    const index = this.contract.parties.length;
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
    const writeableContract = { ... this.contract }

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

    writeableContract.partyIds = this.contract.parties.filter(p => p.party.orgId).map(p => p.party.orgId);

    this.contract = writeableContract;
    await this.contractService.update(this.contract);
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
        titleDetail: this.contract.lastVersion.titles[titleId]
      },
      disableClose: true
    });
    return dialogRef.afterClosed().subscribe((output: ContractTitleDetail | { remove: boolean }) => this.updateTitle(output, titleId));
  }

  /**
   * @param output ContractTitleDetail | { remove: boolean }
   * @param titleId string
   * If output is a boolean (sent by EditTitleComponent) and is set to false : remove title
   * Else, output is a ContractTitleDetail object that is created or updated.
   */
  private async updateTitle(output: ContractTitleDetail | { remove: boolean }, titleIdToRemove?: string, ): Promise<boolean> {
    if (!output) return false;

    const writeableContract = { ... this.contract };

    if ((output as { remove: boolean }).remove === true && titleIdToRemove) {
      delete writeableContract.lastVersion.titles[titleIdToRemove];
      // @TODO (#2090) should also update distribution right ? contractId etc
    } else {
      output = output as ContractTitleDetail;
      const titleId = output.titleId.trim();
      writeableContract.lastVersion.titles[titleId] = output;
      const movie = await this.movieService.getValue(titleId);
      if (!movie) {
        this.snackBar.open(`Title "${titleId}" not found.`, 'close', { duration: 5000 });
        return false;
      }
    }

    // A title have been updated, added or removed. Need to re-calculate contract price.
    calculatePrice(writeableContract.lastVersion);

    // Update contract
    await this.contractService.update(writeableContract);

    this.snackBar.open('Informations updated !', 'close', { duration: 5000 });
    return true;
  }

  /**
   * @dev this method uses titles.price to update global contract price
   */
  public async updatePrice() {
    calculatePrice(this.contract.lastVersion);
    await this.contractService.add(this.contract);
    this.snackBar.open('Contract global price updated !', 'close', { duration: 5000 });
  }
}
