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
import { FullMandate, FullSale, territoryAvailabilities } from '@blockframes/contract/avails/avails';
import { where } from 'firebase/firestore';

const hasImportErrors = (importState: ContractsImportState, type: string = 'error'): boolean => {
  return importState.errors.filter((error: SpreadsheetImportError) => error.type === type).length !== 0;
};

const getTitleContracts = (type: 'mandate' | 'sale', titleId: string) => [
  where('type', '==', type),
  where('titleId', '==', titleId),
  where('status', '==', 'accepted')
];

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
    // Mat table setup @TODO #7429
    this.rows.paginator = this.paginator;
    this.rows.filterPredicate = this.filterPredicate;
    this.rows.sortingDataAccessor = sortingDataAccessor;
    this.rows.sort = this.sort;
  }

  async createContract(importState: ContractsImportState): Promise<boolean> {
    const success = await this.addContract(importState, 'create');
    const message = success
      ? 'Contract added!'
      : `Contract terms overlaps with existing mandate terms. Please update your template file and try again.`;
    this.snackBar.open(message, 'close', { duration: 9000 });
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
        const success = this.addContract(contract, 'create');
        if (success)
          this.processedContracts++;
      }
      this.snackBar.open(`${this.processedContracts}/${creations.length} contracts created!`, 'close', { duration: 3000 });
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

  async getExistingContracts(type: 'sale', titleId: string): Promise<FullSale[]>;
  async getExistingContracts(type: 'mandate', titleId: string): Promise<FullMandate[]>;
  async getExistingContracts(type: 'sale' | 'mandate', titleId: string): Promise<(FullSale | FullMandate)[]> {
    const query = getTitleContracts(type, titleId);
    const contracts = await this.contractService.getValue(query);
    const promises = contracts.map(contract => this.termService.getValue(contract.termIds))
    const terms = await Promise.all(promises);
    return contracts.map((contract, idx) => ({ ...contract, terms: terms[idx] }) as FullSale | FullMandate)
  }

  /**Verifies if terms overlap with existing mandate terms in the Db */
  private async verifyOverlappingMandatesAndSales(importState: ContractsImportState) {
    const mandates = await this.getExistingContracts('mandate', importState.contract.titleId);
    const sales = await this.getExistingContracts('sale', importState.contract.titleId);
    const availabilities = importState.terms.map(term => {
      const data = { avails: term, mandates: [], sales, bucketContracts: [], existingMandates: mandates };
      return territoryAvailabilities(data);
    });
    const isOverlappingSale = importState.contract.type === 'sale' && availabilities.some(availability => availability.sold.length);
    const isOverlappingMandate = importState.contract.type === 'mandate' && availabilities.some(availability => availability.available.length);
    return { isOverlappingSale, isOverlappingMandate };
  }

  /**
   * Adds a contract to database and prevents multi-insert by refreshing mat-table
   * @param importState
   */
  private async addContract(importState: ContractsImportState, mode: 'create' | 'update' = 'update'): Promise<boolean> {
    importState.terms.forEach(t => t.id = this.db.createId());
    importState.contract.termIds = importState.terms.map(t => t.id);
    if (mode === 'create') {
      const overlapConditions = await this.verifyOverlappingMandatesAndSales(importState);
      if (overlapConditions.isOverlappingMandate) {
        importState.errors.push({
          type: 'error',
          name: 'Contract',
          reason: 'The Terms of a Contract overlap with that of an already existing Mandate.',
          hint: 'The Terms of a Contract overlap with that of an already existing Mandate.'
        });
        return false;
      }
      if (overlapConditions.isOverlappingSale) {
        importState.errors.push({
          type: 'error',
          name: 'Contract',
          reason: 'The terms of the imported sale have been sold already.',
          hint: 'The terms of the imported sale have been sold already.'
        });
        return false;
      }
    }
    await this.contractService.add({
      ...importState.contract,
      _meta: createDocumentMeta({ createdAt: new Date() })
    });

    // @dev: Create terms after contract because rules require contract to be created first
    await this.termService.add(importState.terms);

    importState.errors.push({
      type: 'error',
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
