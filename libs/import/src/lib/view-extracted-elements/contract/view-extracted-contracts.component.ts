
import { Component, ChangeDetectionStrategy, OnInit, Input } from '@angular/core';

import { BehaviorSubject } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';

import { MatTableDataSource } from '@angular/material/table';


import { AuthQuery } from '@blockframes/auth/+state';
import { SheetTab } from '@blockframes/utils/spreadsheet';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { OrganizationService } from '@blockframes/organization/+state';
import { TermService } from '@blockframes/contract/term/+state/term.service';
import { ContractService } from '@blockframes/contract/contract/+state/contract.service';

import { formatContract } from './utils';
import { ContractsImportState } from '../../utils';

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
    private termService: TermService,
    private titleService: MovieService,
    private firestore: AngularFirestore,
    private orgService: OrganizationService,
    private contractService: ContractService,
  ) { }

  async ngOnInit() {
    const contractsToCreate = await formatContract(
      this.sheetTab,
      this.termService,
      this.titleService,
      this.orgService,
      this.contractService,
      this.authQuery.orgId,
      this.authQuery.isBlockframesAdmin,
      this.firestore,
    );
    this.contractsToCreate$.next(new MatTableDataSource(contractsToCreate));
  }
}
