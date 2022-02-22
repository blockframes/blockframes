
import { Component, ChangeDetectionStrategy, OnInit, Input } from '@angular/core';

import { BehaviorSubject } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatTableDataSource } from '@angular/material/table';


import { AuthService } from '@blockframes/auth/+state';
import { UserService } from '@blockframes/user/+state';
import { SheetTab } from '@blockframes/utils/spreadsheet';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { OrganizationService } from '@blockframes/organization/+state';
import { ContractService } from '@blockframes/contract/contract/+state/contract.service';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

import { formatContract } from './utils';
import { ContractsImportState } from '../../utils';
import { take } from 'rxjs/operators';

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
    private userService: UserService,
    private authService: AuthService,
    private titleService: MovieService,
    private firestore: AngularFirestore,
    private dynTitle: DynamicTitleService,
    private orgService: OrganizationService,
    private contractService: ContractService,
  ) {
    this.dynTitle.setPageTitle('Submit your contracts');
  }

  async ngOnInit() {
    const isBlockframesAdmin = await this.authService.isBlockframesAdmin$.pipe(take(1)).toPromise();
    const contractsToCreate = await formatContract(
      this.sheetTab,
      this.orgService,
      this.titleService,
      this.contractService,
      this.userService,
      this.firestore,
      isBlockframesAdmin,
      this.authService.profile.orgId,
    );
    this.contractsToCreate$.next(new MatTableDataSource(contractsToCreate));
  }
}
