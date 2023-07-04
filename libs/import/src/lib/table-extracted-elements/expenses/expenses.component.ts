import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Component, Input, ViewChild, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { ViewImportErrorsComponent } from '../view-import-errors/view-import-errors.component';
import { sortingDataAccessor } from '@blockframes/utils/table';
import { ExpensesImportState, SpreadsheetImportError } from '../../utils';
import { createDocumentMeta, createExpense } from '@blockframes/model';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { ExpenseService } from '@blockframes/contract/expense/service';

const hasImportErrors = (importState: ExpensesImportState, type: string = 'error'): boolean => {
  return importState.errors.filter((error: SpreadsheetImportError) => error.type === type).length !== 0;
};

@Component({
  selector: 'import-table-extracted-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableExtractedExpensesComponent implements AfterViewInit {

  @Input() rows: MatTableDataSource<ExpensesImportState>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  public processing = 0;

  public selection = new SelectionModel<ExpensesImportState>(true, []);
  public displayedColumns: string[] = [
    'id',
    'select',
    'expense.id',
    'expense.titleId',
    'expense.contractId',
    'expense.price',
    'expense.currency',
    'errors',
    'warnings',
    'actions',
  ];

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private expenseService: ExpenseService,
    private cdr: ChangeDetectorRef
  ) { }

  ngAfterViewInit(): void {
    this.rows.paginator = this.paginator;
    this.rows.filterPredicate = this.filterPredicate;
    this.rows.sortingDataAccessor = sortingDataAccessor;
    this.rows.sort = this.sort;
  }

  async create(importState: ExpensesImportState) {
    await this.add(importState);
    this.snackBar.open('Expense added!', 'close', { duration: 9000 });
  }

  async createSelected() {
    try {
      const creations = this.selection.selected.filter(importState => !hasImportErrors(importState));
      for (const expense of creations) {
        await this.add(expense, { increment: true });
      }

      const text = this.processing === creations.length
        ? `${creations.length}/${creations.length} expense(s) created!`
        : `Could not import all expenses (${this.processing} / ${this.selection.selected.length})`;
      this.snackBar.open(text, 'close', { duration: 3000 });

      this.processing = 0;
    } catch (err) {
      console.error(err);
      this.snackBar.open(`Could not import all expenses (${this.processing} / ${this.selection.selected.length})`, 'close', { duration: 3000 });
      this.processing = 0;
    }

    this.cdr.markForCheck();
  }

  /**
   * Adds an expense to database and prevents multi-insert by refreshing mat-table
   * @param importState
   */
  private async add(importState: ExpensesImportState, { increment } = { increment: false }) {
    importState.importing = true;
    this.cdr.markForCheck();

    if (increment) this.processing++;
    this.cdr.markForCheck();

    await this.expenseService.add(createExpense({
      ...importState.expense,
      _meta: createDocumentMeta({ createdAt: new Date() })
    }));

    importState.imported = true;

    importState.importing = false;
    this.cdr.markForCheck();
    return true;
  }

  ///////////////////
  // POPINS
  ///////////////////

  displayErrors(importState: ExpensesImportState) {
    this.dialog.open(ViewImportErrorsComponent, {
      data: createModalData({
        title: `Expense id ${importState.expense.id}`,
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
  checkboxLabel(row?: ExpensesImportState): string {
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
  public filterPredicate(data: ExpensesImportState, filter: string) {
    const dataStr = data.expense.id;
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }

}
