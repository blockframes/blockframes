import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Component, Input, ViewChild, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
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
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  public processing = 0;

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
    private orgService: OrganizationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngAfterViewInit(): void {
    this.rows.paginator = this.paginator;
    this.rows.filterPredicate = this.filterPredicate;
    this.rows.sortingDataAccessor = sortingDataAccessor;
    this.rows.sort = this.sort;
  }

  async create(importState: OrganizationsImportState) {
    await this.add(importState);
    this.snackBar.open('Organization added!', 'close', { duration: 3000 });
  }

  async createSelected() {
    try {
      const creations = this.selection.selected.filter(importState => importState.newOrg && !hasImportErrors(importState));
      for (const org of creations) {
        await this.add(org, { increment: true });
      }
      this.snackBar.open(`${this.processing} organizations created!`, 'close', { duration: 3000 });
      this.processing = 0;
    } catch (err) {
      this.snackBar.open(`Could not import all organizations (${this.processing} / ${this.selection.selected.length})`, 'close', { duration: 3000 });
      this.processing = 0;
    }
    this.cdr.markForCheck();
  }

  /**
   * Adds an org to database and prevents multi-insert by refreshing mat-table
   * @param importState
   */
  private async add(importState: OrganizationsImportState, { increment } = { increment: false }) {
    if (increment) this.processing++;
    importState.importing = true;
    this.cdr.markForCheck();
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
    importState.imported = true;

    importState.importing = false;
    this.cdr.markForCheck();
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
      : this.rows.data.filter(row => !row.imported).forEach(row => this.selection.select(row));
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
