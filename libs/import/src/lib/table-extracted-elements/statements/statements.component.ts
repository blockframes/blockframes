import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Component, Input, ViewChild, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { ViewImportErrorsComponent } from '../view-import-errors/view-import-errors.component';
import { sortingDataAccessor } from '@blockframes/utils/table';
import { StatementsImportState, SpreadsheetImportError } from '../../utils';
import {
  DistributorStatement,
  ProducerStatement,
  createDocumentMeta,
  createStatement,
  isDistributorStatement,
  isProducerStatement,
  createIncome,
  createExpense
} from '@blockframes/model';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { StatementService } from '@blockframes/waterfall/statement.service';
import { IncomeService } from '@blockframes/contract/income/service';
import { ExpenseService } from '@blockframes/contract/expense/service';

const hasImportErrors = (importState: StatementsImportState, type: string = 'error'): boolean => {
  return importState.errors.filter((error: SpreadsheetImportError) => error.type === type).length !== 0;
};

@Component({
  selector: 'import-table-extracted-statements',
  templateUrl: './statements.component.html',
  styleUrls: ['./statements.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableExtractedStatementsComponent implements AfterViewInit {

  @Input() rows: MatTableDataSource<StatementsImportState>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  public processing = 0;

  public selection = new SelectionModel<StatementsImportState>(true, []);
  public displayedColumns: string[] = [
    'id',
    'select',
    'statement.id',
    'statement.waterfallId',
    'statement.contractId',
    'errors',
    'warnings',
    'actions',
  ];

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private statementService: StatementService,
    private incomeService: IncomeService,
    private expenseService: ExpenseService,
    private cdr: ChangeDetectorRef
  ) { }

  ngAfterViewInit(): void {
    this.rows.paginator = this.paginator;
    this.rows.filterPredicate = this.filterPredicate;
    this.rows.sortingDataAccessor = sortingDataAccessor;
    this.rows.sort = this.sort;
  }

  async create(importState: StatementsImportState) {
    await this.add(importState);
    this.snackBar.open('Statement added!', 'close', { duration: 9000 });
  }

  async createSelected() {
    try {
      const creations = this.selection.selected.filter(importState => !hasImportErrors(importState));
      for (const statement of creations) {
        await this.add(statement, { increment: true });
      }

      const text = this.processing === creations.length
        ? `${creations.length}/${creations.length} statement(s) created!`
        : `Could not import all statements (${this.processing} / ${this.selection.selected.length})`;
      this.snackBar.open(text, 'close', { duration: 3000 });

      this.processing = 0;
    } catch (err) {
      console.error(err);
      this.snackBar.open(`Could not import all statements (${this.processing} / ${this.selection.selected.length})`, 'close', { duration: 3000 });
      this.processing = 0;
    }

    this.cdr.markForCheck();
  }

  /**
   * Adds an statement to database and prevents multi-insert by refreshing mat-table
   * @param importState
   */
  private async add(importState: StatementsImportState, { increment } = { increment: false }) {
    importState.importing = true;
    this.cdr.markForCheck();

    if (increment) this.processing++;
    this.cdr.markForCheck();

    const statement = createStatement({
      ...importState.statement,
      _meta: createDocumentMeta({ createdAt: new Date() })
    });

    if (isDistributorStatement(statement)) await this.statementService.add<DistributorStatement>(statement, { params: { waterfallId: statement.waterfallId } });
    if (isProducerStatement(statement)) await this.statementService.add<ProducerStatement>(statement, { params: { waterfallId: statement.waterfallId } });
    if (isDistributorStatement(statement)) await this.statementService.add<DistributorStatement>(statement, { params: { waterfallId: statement.waterfallId } });

    for (const income of importState.incomes) {
      await this.incomeService.add(createIncome({
        ...income,
        _meta: createDocumentMeta({ createdAt: new Date() })
      }));
    }

    for (const expense of importState.expenses) {
      await this.expenseService.add(createExpense({
        ...expense,
        _meta: createDocumentMeta({ createdAt: new Date() })
      }));
    }

    importState.imported = true;

    importState.importing = false;
    this.cdr.markForCheck();
    return true;
  }

  ///////////////////
  // POPINS
  ///////////////////

  displayErrors(importState: StatementsImportState) {
    this.dialog.open(ViewImportErrorsComponent, {
      data: createModalData({
        title: `Statement id ${importState.statement.id}`,
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
  checkboxLabel(row?: StatementsImportState): string {
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
  public filterPredicate(data: StatementsImportState, filter: string) {
    const dataStr = data.statement.id;
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }

}
