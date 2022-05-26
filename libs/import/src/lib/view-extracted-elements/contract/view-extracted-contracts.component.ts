
import { Component, ChangeDetectionStrategy, OnInit, Input, Inject } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { AuthService } from '@blockframes/auth/service';
import { UserService } from '@blockframes/user/service';
import { SheetTab } from '@blockframes/utils/spreadsheet';
import { MovieService } from '@blockframes/movie/service';
import { OrganizationService } from '@blockframes/organization/service';
import { ContractService } from '@blockframes/contract/contract/+state/contract.service';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { APP } from '@blockframes/utils/routes/utils';
import { App } from '@blockframes/model';
import { formatContract } from './utils';
import { ContractsImportState } from '../../utils';
import { TermService } from '@blockframes/contract/term/+state/term.service';

@Component({
  selector: 'import-view-extracted-contracts[sheetTab]',
  templateUrl: './view-extracted-contracts.component.html',
  styleUrls: ['./view-extracted-contracts.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ViewExtractedContractsComponent implements OnInit {

  @Input() sheetTab: SheetTab;

  public contractsToCreate$ = new BehaviorSubject<MatTableDataSource<ContractsImportState>>(null);
  private isCatalogApp = this.app === 'catalog';

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private titleService: MovieService,
    private termsService: TermService,
    private dynTitle: DynamicTitleService,
    private orgService: OrganizationService,
    private contractService: ContractService,
    @Inject(APP) private app: App,
  ) {
    this.dynTitle.setPageTitle('Submit your contracts');
  }

  async ngOnInit() {
    const isBlockframesAdmin = await firstValueFrom(this.authService.isBlockframesAdmin$);
    const contractsToCreate = await formatContract(
      this.sheetTab,
      this.orgService,
      this.titleService,
      this.contractService,
      this.termsService,
      this.userService,
      isBlockframesAdmin,
      this.authService.profile.orgId,
      { isSeller: this.isCatalogApp }
    );
    this.contractsToCreate$.next(new MatTableDataSource(contractsToCreate));
  }
}
