import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Component, Input, ViewChild, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { ViewImportErrorsComponent } from '../view-import-errors/view-import-errors.component';
import { sortingDataAccessor } from '@blockframes/utils/table';
import { SourcesImportState, SpreadsheetImportError } from '../../utils';
import { createWaterfallSource } from '@blockframes/model';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';

const hasImportErrors = (importState: SourcesImportState, type: string = 'error'): boolean => {
  return importState.errors.filter((error: SpreadsheetImportError) => error.type === type).length !== 0;
};

@Component({
  selector: 'import-table-extracted-sources',
  templateUrl: './sources.component.html',
  styleUrls: ['./sources.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableExtractedSourcesComponent implements AfterViewInit {

  @Input() rows: MatTableDataSource<SourcesImportState>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  public processing = 0;

  public selection = new SelectionModel<SourcesImportState>(true, []);
  public displayedColumns: string[] = [
    'id',
    'select',
    'source.id',
    'waterfallId',
    'source.name',
    'source.destinationId',
    'errors',
    'warnings',
    'actions',
  ];

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private waterfallService: WaterfallService,
    private cdr: ChangeDetectorRef
  ) { }

  ngAfterViewInit(): void {
    this.rows.paginator = this.paginator;
    this.rows.filterPredicate = this.filterPredicate;
    this.rows.sortingDataAccessor = sortingDataAccessor;
    this.rows.sort = this.sort;
  }

  async create(importState: SourcesImportState) {
    await this.add(importState);
    this.snackBar.open('Source added!', 'close', { duration: 9000 });
  }

  async createSelected() {
    try {
      const creations = this.selection.selected.filter(importState => !hasImportErrors(importState));
      for (const source of creations) {
        await this.add(source, { increment: true });
      }

      const text = this.processing === creations.length
        ? `${creations.length}/${creations.length} source(s) created!`
        : `Could not import all sources (${this.processing} / ${this.selection.selected.length})`;
      this.snackBar.open(text, 'close', { duration: 3000 });

      this.processing = 0;
    } catch (err) {
      console.error(err);
      this.snackBar.open(`Could not import all sources (${this.processing} / ${this.selection.selected.length})`, 'close', { duration: 3000 });
      this.processing = 0;
    }

    this.cdr.markForCheck();
  }

  /**
   * Adds an source to database and prevents multi-insert by refreshing mat-table
   * @param importState
   */
  private async add(importState: SourcesImportState, { increment } = { increment: false }) {
    importState.importing = true;
    this.cdr.markForCheck();

    if (increment) this.processing++;
    this.cdr.markForCheck();

    await this.waterfallService.addSource(importState.waterfallId, createWaterfallSource(importState.source));

    importState.imported = true;

    importState.importing = false;
    this.cdr.markForCheck();
    return true;
  }

  ///////////////////
  // POPINS
  ///////////////////

  displayErrors(importState: SourcesImportState) {
    this.dialog.open(ViewImportErrorsComponent, {
      data: createModalData({
        title: `Source id ${importState.source.id}`,
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
  checkboxLabel(row?: SourcesImportState): string {
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
  public filterPredicate(data: SourcesImportState, filter: string) {
    const dataStr = data.source.id;
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }

}
