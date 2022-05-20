import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Component, Input, ViewChild, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { ViewImportErrorsComponent } from '../view-import-errors/view-import-errors.component';
import { ContractService } from '@blockframes/contract/contract/+state/contract.service';
import { sortingDataAccessor } from '@blockframes/utils/table';
import { ContractsImportState, SpreadsheetImportError } from '../../utils';
import { TermService } from '@blockframes/contract/term/+state/term.service';
import { createDocumentMeta } from '@blockframes/model';
import { Firestore } from '@angular/fire/firestore';
import { doc, collection } from 'firebase/firestore';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';

const hasImportErrors = (importState: ContractsImportState, type: string = 'error'): boolean => {
  return importState.errors.filter((error: SpreadsheetImportError) => error.type === type).length !== 0;
};

@Component({
  selector: 'import-table-extracted-contracts',
  templateUrl: './contracts.component.html',
  styleUrls: ['./contracts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableExtractedContractsComponent implements AfterViewInit {

  @Input() rows: MatTableDataSource<ContractsImportState>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  public processing = 0;

  public selection = new SelectionModel<ContractsImportState>(true, []);
  public displayedColumns: string[] = [
    'id',
    'select',
    'contract.id',
    'contract.type',
    'errors',
    'warnings',
    'actions',
  ];

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private contractService: ContractService,
    private termService: TermService,
    private db: Firestore,
    private cdr: ChangeDetectorRef
  ) { }

  ngAfterViewInit(): void {
    this.rows.paginator = this.paginator;
    this.rows.filterPredicate = this.filterPredicate;
    this.rows.sortingDataAccessor = sortingDataAccessor;
    this.rows.sort = this.sort;
  }

  async create(importState: ContractsImportState) {
    const success = await this.add(importState);
    const message = success
      ? 'Contract added!'
      : 'Contract terms overlaps with existing mandate terms. Please update your template file and try again.';
    this.snackBar.open(message, 'close', { duration: 9000 });
  }

  async createSelected() {
    try {
      const creations = this.selection.selected.filter(importState => importState.newContract && !hasImportErrors(importState));
      for (const contract of creations) {
        await this.add(contract, { increment: true });
      }

      const text = this.processing === creations.length
        ? `${creations.length}/${creations.length} contract(s) created!`
        : `Could not import all contracts (${this.processing} / ${this.selection.selected.length})`;
      this.snackBar.open(text, 'close', { duration: 3000 });

      this.processing = 0;
    } catch (err) {
      console.error(err);
      this.snackBar.open(`Could not import all contracts (${this.processing} / ${this.selection.selected.length})`, 'close', { duration: 3000 });
      this.processing = 0;
    }

    this.cdr.markForCheck();
  }

  /**
   * Adds a contract to database and prevents multi-insert by refreshing mat-table
   * @param importState
   */
  private async add(importState: ContractsImportState, { increment } = { increment: false }) {
    importState.imported=true;
    return true;

    importState.importing = true;
    this.cdr.markForCheck();
    importState.terms.forEach(t => t.id = doc(collection(this.db, '_')).id);
    importState.contract.termIds = importState.terms.map(t => t.id);



    if (increment) this.processing++;
    this.cdr.markForCheck();

    await this.contractService.add({
      ...importState.contract,
      _meta: createDocumentMeta({ createdAt: new Date() })
    });

    // @dev: Create terms after contract because rules require contract to be created first
    await this.termService.add(importState.terms);

    importState.imported = true;

    importState.importing = false;
    this.cdr.markForCheck();
    return true;
  }

  ///////////////////
  // POPINS
  ///////////////////

  displayErrors(importState: ContractsImportState) {
    this.dialog.open(ViewImportErrorsComponent, {
      data: createModalData({
        title: `Contract id ${importState.contract.id}`,
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
  checkboxLabel(row?: ContractsImportState): string {
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
  public filterPredicate(data: ContractsImportState, filter: string) {
    const dataStr = data.contract.id;
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }

}
