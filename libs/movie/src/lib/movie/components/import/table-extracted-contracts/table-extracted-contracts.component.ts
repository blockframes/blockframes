import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Component, Input, ViewChild, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MovieService, MovieQuery, cleanModel, createMovie } from '../../../+state';
import { SelectionModel } from '@angular/cdk/collections';
import { SpreadsheetImportError, ContractsImportState } from '../view-extracted-elements/view-extracted-elements.component';
import { ViewImportErrorsComponent } from '../view-import-errors/view-import-errors.component';

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

  public selection = new SelectionModel<ContractsImportState>(true, []);
  public displayedColumns: string[] = [
    'id',
    'select',
    'contract.id',
    'errors',
    'warnings',
    'actions',
  ];

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private movieService: MovieService,
    private movieQuery: MovieQuery,
  ) { }

  ngOnInit() {
    // Mat table setup
    this.rows.paginator = this.paginator;
    this.rows.filterPredicate = this.filterPredicate;
    this.rows.sortingDataAccessor = this.sortingDataAccessor;
    this.rows.sort = this.sort;
  }

  async createContract(importState: ContractsImportState): Promise<boolean> {

    const contractId = await this.movieService.addContract(importState.contract);
    importState.errors.push({
      type: 'error',
      field: 'contract',
      name: 'Contract',
      reason: 'Contract already added',
      hint: 'Contract already added'
    });

    this.snackBar.open(`Contract ${contractId} added!`, 'close', { duration: 3000 });

    return true;
  }
  
  async updateContract(importState: ContractsImportState): Promise<boolean> {
    // @todo #1462 implement this
    return this.createContract(importState);
  }
  

  async createSelectedContracts(): Promise<boolean> {
    try {
      const data = this.rows.data;
      const promises = [];
      this.selection.selected
        .filter(importState => !hasImportErrors(importState))
        .map(importState => {

          importState.errors.push({
            type: 'error',
            field: 'contract',
            name: 'Contract',
            reason: 'Contract already added',
            hint: 'Contract already added'
          });

          return promises.push(this.movieService.addContract(importState.contract));
        });
      
      this.rows.data = data;

      await Promise.all(promises);
      this.snackBar.open(`${promises.length} contracts imported!`, 'close', { duration: 3000 });
      return true;
    } catch (err) {
      this.snackBar.open(`Could not import contracts`, 'close', { duration: 3000 });
    }
  }

  errorCount(data: ContractsImportState, type: string = 'error') {
    return data.errors.filter((error: SpreadsheetImportError) => error.type === type).length;
  }

  ///////////////////
  // POPINS
  ///////////////////

  displayErrors(importState: ContractsImportState) {
    const data = { title: '-- @todo #1462', errors: importState.errors };
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
    this.isAllSelected() ?
      this.selection.clear() :
      this.rows.data.forEach(row => this.selection.select(row));
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
    const dataStr = data.contract.id; // @todo #1462
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }

}
