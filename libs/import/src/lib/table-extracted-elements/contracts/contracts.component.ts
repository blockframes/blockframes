import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Component, Input, ViewChild, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { ViewImportErrorsComponent } from '../view-import-errors/view-import-errors.component';
import { ContractService } from '@blockframes/contract/contract/+state/contract.service';
import { sortingDataAccessor } from '@blockframes/utils/table';
import { ContractsImportState, SpreadsheetImportError } from '../../utils';
import { TermService } from '@blockframes/contract/term/+state/term.service';
import { createDocumentMeta } from '@blockframes/utils/models-meta';
import { AngularFirestore } from '@angular/fire/firestore';

const hasImportErrors = (importState: ContractsImportState, type: string = 'error'): boolean => {
  return importState.errors.filter((error: SpreadsheetImportError) => error.type === type).length !== 0;
};

@Component({
  selector: 'import-table-extracted-contracts',
  templateUrl: './contracts.component.html',
  styleUrls: ['./contracts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableExtractedContractsComponent implements OnInit {

  @Input() rows: MatTableDataSource<ContractsImportState>;
  @Input() mode: string;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  public processedContracts = 0;

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
    private db: AngularFirestore,
  ) { }

  ngOnInit() {
    // Mat table setup
    this.rows.paginator = this.paginator;
    this.rows.filterPredicate = this.filterPredicate;
    this.rows.sortingDataAccessor = sortingDataAccessor;
    this.rows.sort = this.sort;
  }

  async createContract(importState: ContractsImportState): Promise<boolean> {
    await this.addContract(importState);
    this.snackBar.open('Contract added!', 'close', { duration: 3000 });
    return true;
  }

  async updateContract(importState: ContractsImportState): Promise<boolean> {
    await this.addContract(importState);
    this.snackBar.open('Contract updated!', 'close', { duration: 3000 });
    return true;
  }

  async createSelectedContracts(): Promise<boolean> {
    try {
      const creations = this.selection.selected.filter(importState => importState.newContract && !hasImportErrors(importState));
      for (const contract of creations) {
        this.processedContracts++;
        await this.addContract(contract);
      }
      this.snackBar.open(`${this.processedContracts} contracts created!`, 'close', { duration: 3000 });
      this.processedContracts = 0;
      return true;
    } catch (err) {
      console.error(err)
      this.snackBar.open(`Could not import all contracts (${this.processedContracts} / ${this.selection.selected.length})`, 'close', { duration: 3000 });
      this.processedContracts = 0;
    }
  }

  async updateSelectedContracts(): Promise<boolean> {
    try {
      const updates = this.selection.selected.filter(importState => !importState.newContract && !hasImportErrors(importState));
      for (const contract of updates) {
        this.processedContracts++;
        await this.addContract(contract);
      }
      this.snackBar.open(`${this.processedContracts} contracts updated!`, 'close', { duration: 3000 });
      this.processedContracts = 0;
      return true;
    } catch (err) {
      this.snackBar.open(`Could not update all contracts (${this.processedContracts} / ${this.selection.selected.length})`, 'close', { duration: 3000 });
      this.processedContracts = 0;
    }
  }

  /**
   * Adds a contract to database and prevents multi-insert by refreshing mat-table
   * @param importState
   */
  private async addContract(importState: ContractsImportState): Promise<boolean> {

    importState.terms.forEach(t => t.id = this.db.createId());
    importState.contract.termIds = importState.terms.map(t => t.id);

    await this.contractService.add({
      ...importState.contract,
      _meta: createDocumentMeta({createdAt: new Date()})
    });

    // @dev: Create terms after contract because rules require contract to be created first
    await this.termService.add(importState.terms);

    importState.errors.push({
      type: 'error',
      field: 'contract',
      name: 'Contract',
      reason: 'Contract already added',
      hint: 'Contract already added'
    });
    return true;
  }

  errorCount(data: ContractsImportState, type: string = 'error') {
    return data.errors.filter((error: SpreadsheetImportError) => error.type === type).length;
  }

  parseInt(str: string): number {
    return parseInt(str, 10);
  }

  ///////////////////
  // POPINS
  ///////////////////

  displayErrors(importState: ContractsImportState) {
    const data = { title: `Contract id ${importState.contract.id}`, errors: importState.errors };
    this.dialog.open(ViewImportErrorsComponent, { data, width: '50%' });
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
