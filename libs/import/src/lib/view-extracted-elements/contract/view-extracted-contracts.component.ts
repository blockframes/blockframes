
import { Component, ChangeDetectionStrategy, OnInit, Optional, Input, Output, EventEmitter } from '@angular/core';

import { Intercom } from 'ng-intercom';
import { BehaviorSubject } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';

import { MatTableDataSource } from '@angular/material/table';


import { SheetTab } from '@blockframes/utils/spreadsheet';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { OrganizationService } from '@blockframes/organization/+state';
import { ContractService } from '@blockframes/contract/contract/+state/contract.service';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

import { ContractsImportState } from '../../utils';
import { formatContract } from './utils';
import { AuthQuery } from '@blockframes/auth/+state';

@Component({
  selector: 'import-view-extracted-contracts[sheetTab]',
  templateUrl: './view-extracted-contracts.component.html',
  styleUrls: ['./view-extracted-contracts.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ViewExtractedContractsComponent implements OnInit {

  @Input() sheetTab: SheetTab;

  public contractsToCreate$ = new BehaviorSubject<MatTableDataSource<ContractsImportState>>(null);

  constructor(
    private authQuery: AuthQuery,
    private titleService: MovieService,
    private firestore: AngularFirestore,
    private dynTitle: DynamicTitleService,
    private orgService: OrganizationService,
    private contractService: ContractService,
  ) {
    this.dynTitle.setPageTitle('Submit your contracts');
  }

  async ngOnInit() {
    const contractsToCreate = await formatContract(
      this.sheetTab,
      this.orgService,
      this.titleService,
      this.contractService,
      this.firestore,
      this.authQuery.isBlockframesAdmin,
      this.authQuery.orgId,
    );
    this.contractsToCreate$.next(new MatTableDataSource(contractsToCreate));
  }
}
