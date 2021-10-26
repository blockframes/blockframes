
import { Component, ChangeDetectionStrategy, OnInit, Input } from '@angular/core';

import { BehaviorSubject } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';

import { UserService } from '@blockframes/user/+state';
import { SheetTab } from '@blockframes/utils/spreadsheet';
import { OrganizationService } from '@blockframes/organization/+state';

import { formatOrg } from './utils';
import { OrganizationsImportState } from '../../utils';
import { AngularFirestore } from '@angular/fire/firestore';


@Component({
  selector: 'import-view-extracted-organizations[sheetTab]',
  templateUrl: './view-extracted-organizations.component.html',
  styleUrls: ['./view-extracted-organizations.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ViewExtractedOrganizationsComponent implements OnInit {

  @Input() sheetTab: SheetTab;

  public orgsToCreate$ = new BehaviorSubject<MatTableDataSource<OrganizationsImportState>>(null);
  public orgsToUpdate$ = new BehaviorSubject<MatTableDataSource<OrganizationsImportState>>(null);

  constructor(
    private userService: UserService,
    private firestore: AngularFirestore,
    private organizationService: OrganizationService,
  ) { }

  async ngOnInit() {
    const orgsToCreate = await formatOrg(this.sheetTab, this.organizationService, this.userService, this.firestore);
    this.orgsToCreate$.next(new MatTableDataSource(orgsToCreate));
  }
}
