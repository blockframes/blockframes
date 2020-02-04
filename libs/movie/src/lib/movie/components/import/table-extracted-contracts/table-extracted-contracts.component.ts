import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Component, Input, ViewChild, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { SpreadsheetImportError, ContractsImportState } from '../view-extracted-elements/view-extracted-elements.component';
import { ViewImportErrorsComponent } from '../view-import-errors/view-import-errors.component';
import { ContractService } from '@blockframes/contract/contract/+state/contract.service';

const hasImportErrors = (importState: ContractsImportState, type: string = 'error'): boolean => {
  return importState.errors.filter((error: SpreadsheetImportError) => error.type === type).length !== 0;
};

@Component({
  selector: 'movie-table-extracted-contracts',
  templateUrl: './table-extracted-contracts.component.html',
  styleUrls: ['./table-extracted-contracts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableExtractedContractsComponent implements OnInit {

  @Input() rows: MatTableDataSource<ContractsImportState>;
  @Input() mode: string;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  public processedContracts = 0;

  public selection = new SelectionModel<ContractsImportState>(true, []);
  public displayedColumns: string[] = [
    'id',
    'select',
    'contract.doc.id',
    'contract.last.status',
    'contract.last.id',
    'contract.doc.parentContractIds',
    'contract.doc.childContractIds',
    'contract.doc.parties',
    'errors',
    'warnings',
    'actions',
  ];

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private contractService: ContractService
  ) { }

  ngOnInit() {
    // Mat table setup
    this.rows.paginator = this.paginator;
    this.rows.filterPredicate = this.filterPredicate;
    this.rows.sortingDataAccessor = this.sortingDataAccessor;
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
    const data = this.rows.data;
    await this.contractService.addContractAndVersion(importState.contract)
    importState.errors.push({
      type: 'error',
      field: 'contract',
      name: 'Contract',
      reason: 'Contract already added',
      hint: 'Contract already added'
    });
    this.rows.data = data;
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
    const data = { title: `Contract id ${importState.contract.doc.id} v-${importState.contract.last.id}`, errors: importState.errors };
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
   * Allow to sort nested object
   */
  sortingDataAccessor(item, property) {
    if (property.includes('.')) {
      return property.split('.')
        .reduce((object, key) => object[key], item);
    }
    return item[property];
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
  filterPredicate(data: ContractsImportState, filter) {
    const dataStr = data.contract.doc.id + data.contract.last.id + data.contract.last.creationDate + data.contract.last.price.amount;
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }

}
