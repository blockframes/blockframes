import { Component, ChangeDetectionStrategy, OnInit, Input } from '@angular/core';

import { BehaviorSubject } from 'rxjs';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';

import { UserService } from '@blockframes/user/service';
import { SheetTab } from '@blockframes/utils/spreadsheet';
import { OrganizationService } from '@blockframes/organization/service';

import { formatOrg } from './utils';
import { OrganizationsImportState } from '../../utils';
import { centralOrgId } from '@env';

@Component({
  selector: 'import-view-extracted-organizations[sheetTab]',
  templateUrl: './view-extracted-organizations.component.html',
  styleUrls: ['./view-extracted-organizations.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ViewExtractedOrganizationsComponent implements OnInit {

  @Input() sheetTab: SheetTab;

  public orgsToCreate$ = new BehaviorSubject<MatTableDataSource<OrganizationsImportState>>(null);

  constructor(
    private userService: UserService,
    private organizationService: OrganizationService,
  ) { }

  async ngOnInit() {
    const centralOrg = await this.organizationService.getValue(centralOrgId.catalog);
    const orgsToCreate = await formatOrg(this.sheetTab, this.organizationService, this.userService, centralOrg);
    this.orgsToCreate$.next(new MatTableDataSource(orgsToCreate));
  }
}
