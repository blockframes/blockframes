import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Component, Input, ViewChild, ChangeDetectionStrategy, AfterViewInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { ViewImportErrorsComponent } from '../view-import-errors/view-import-errors.component';
import { sortingDataAccessor } from '@blockframes/utils/table';
import { OrganizationsImportState, SpreadsheetImportError } from '../../utils';
import { OrganizationService } from '@blockframes/organization/+state';
import { AuthService } from '@blockframes/auth/+state';
import { PublicUser, getOrgAppAccess } from '@blockframes/model';
import { OrgEmailData } from '@blockframes/utils/emails/utils';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';

const hasImportErrors = (importState: OrganizationsImportState, type: string = 'error'): boolean => {
  return importState.errors.filter((error: SpreadsheetImportError) => error.type === type).length !== 0;
};

@Component({
  selector: 'import-table-extracted-organizations',
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableExtractedOrganizationsComponent implements AfterViewInit {

  @Input() rows: MatTableDataSource<OrganizationsImportState>;
  @Input() mode: string;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  public processedOrgs = 0;

  public selection = new SelectionModel<OrganizationsImportState>(true, []);
  public displayedColumns: string[] = [
    'id',
    'select',
    'org.id',
    'org.denomination.full',
    'org.email',
    'superAdmin.email',
    'errors',
    'warnings',
    'actions',
  ];

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private authService: AuthService,
    private orgService: OrganizationService
  ) { }

  ngAfterViewInit(): void {
    this.rows.paginator = this.paginator;
    this.rows.filterPredicate = this.filterPredicate;
    this.rows.sortingDataAccessor = sortingDataAccessor;
    this.rows.sort = this.sort;
  }

  async createOrg(importState: OrganizationsImportState): Promise<boolean> {
    await this.addOrganization(importState);
    this.snackBar.open('Organization added!', 'close', { duration: 3000 });
    return true;
  }

  async updateOrg(importState: OrganizationsImportState): Promise<boolean> {
    await this.addOrganization(importState);
    this.snackBar.open('Organization updated!', 'close', { duration: 3000 });
    return true;
  }

  async createSelectedOrgs(): Promise<boolean> {
    try {
      const creations = this.selection.selected.filter(importState => importState.newOrg && !hasImportErrors(importState));
      for (const org of creations) {
        await this.addOrganization(org);
        this.processedOrgs++;
      }
      this.snackBar.open(`${this.processedOrgs} organizations created!`, 'close', { duration: 3000 });
      this.processedOrgs = 0;
      return true;
    } catch (err) {
      this.snackBar.open(`Could not import all organizations (${this.processedOrgs} / ${this.selection.selected.length})`, 'close', { duration: 3000 });
      this.processedOrgs = 0;
    }
  }

  async updateSelectedOrgs(): Promise<boolean> {
    try {
      const updates = this.selection.selected.filter(importState => !importState.newOrg && !hasImportErrors(importState));
      for (const org of updates) {
        this.processedOrgs++;
        await this.addOrganization(org);
      }
      this.snackBar.open(`${this.processedOrgs} organizations updated!`, 'close', { duration: 3000 });
      this.processedOrgs = 0;
      return true;
    } catch (err) {
      this.snackBar.open(`Could not update all organizations (${this.processedOrgs} / ${this.selection.selected.length})`, 'close', { duration: 3000 });
      this.processedOrgs = 0;
    }
  }

  /**
   * Adds an org to database and prevents multi-insert by refreshing mat-table
   * @param importState
   */
  private async addOrganization(importState: OrganizationsImportState): Promise<boolean> {

    const [firstApp] = getOrgAppAccess(importState.org);
    const superAdmin = importState.superAdmin;

    const orgData: OrgEmailData = {
      denomination: importState.org.denomination.full ?? importState.org.denomination.public,
      id: importState.org.id || '',
      email: importState.org.email || ''
    }

    const newUser: PublicUser = await this.authService.createUser(
      importState.superAdmin.email,
      orgData,
      firstApp
    );

    superAdmin.uid = newUser.uid;

    await this.orgService.addOrganization(importState.org, firstApp, superAdmin);

    // prevent user to create the same org twice
    importState.errors.push({
      type: 'error',
      name: 'Organizations',
      reason: 'Organization already created!',
    });

    return true;
  }

  errorCount(data: OrganizationsImportState, type: string = 'error') {
    return data.errors.filter((error: SpreadsheetImportError) => error.type === type).length;
  }

  parseInt(str: string): number {
    return parseInt(str, 10);
  }

  ///////////////////
  // POPINS
  ///////////////////

  displayErrors(importState: OrganizationsImportState) {
    this.dialog.open(ViewImportErrorsComponent, {
      data: createModalData({
        title: `Organization id ${importState.org.id}`,
        errors: importState.errors
      })
    });
  }

  ///////////////////
  // MAT Table Logic
  ///////////////////

  /**
   * Whether the number of selected elements matches the total number of rows.
   */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.rows.data.length;
    return numSelected === numRows;
  }

  /**
   * Selects all rows if they are not all selected; otherwise clear selection.
   */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.rows.data.forEach(row => this.selection.select(row));
  }

  /**
   * The label for the checkbox on the passed row
   */
  checkboxLabel(row?: OrganizationsImportState): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row`;
  }

  /**
   * Apply filter on MAT table with filterValue
   */
  applyFilter(filterValue: string) {
    this.rows.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Specify the fields in which filter is possible.
   * Even for nested objects.
   */
  public filterPredicate(data: OrganizationsImportState, filter: string) {
    const dataStr = data.org.id + data.org.denomination.full + data.org.denomination.public + data.org.email;
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }

}
