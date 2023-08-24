import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Component, Input, ViewChild, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { ViewImportErrorsComponent } from '../view-import-errors/view-import-errors.component';
import { sortingDataAccessor } from '@blockframes/utils/table';
import { RightsImportState, SpreadsheetImportError } from '../../utils';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { RightService } from '@blockframes/waterfall/right.service';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';

const hasImportErrors = (importState: RightsImportState, type: string = 'error'): boolean => {
  return importState.errors.filter((error: SpreadsheetImportError) => error.type === type).length !== 0;
};

@Component({
  selector: 'import-table-extracted-rights',
  templateUrl: './rights.component.html',
  styleUrls: ['./rights.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableExtractedRightsComponent implements AfterViewInit {

  @Input() rows: MatTableDataSource<RightsImportState>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  public processing = 0;

  public selection = new SelectionModel<RightsImportState>(true, []);
  public displayedColumns: string[] = [
    'id',
    'select',
    'waterfallId',
    'right.id',
    'right.actionName',
    'errors',
    'warnings',
    'actions',
  ];

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private rightService: RightService,
    private waterfallService: WaterfallService,
    private cdr: ChangeDetectorRef
  ) { }

  ngAfterViewInit(): void {
    this.rows.paginator = this.paginator;
    this.rows.filterPredicate = this.filterPredicate;
    this.rows.sortingDataAccessor = sortingDataAccessor;
    this.rows.sort = this.sort;
  }

  async create(importState: RightsImportState) {
    await this.add(importState);
    this.snackBar.open('Right added!', 'close', { duration: 9000 });
  }

  async createSelected() {
    try {
      const creations = this.selection.selected.filter(importState => !hasImportErrors(importState));
      for (const right of creations) {
        await this.add(right, { increment: true });
      }

      const text = this.processing === creations.length
        ? `${creations.length}/${creations.length} right(s) created!`
        : `Could not import all rights (${this.processing} / ${this.selection.selected.length})`;
      this.snackBar.open(text, 'close', { duration: 3000 });

      this.processing = 0;
    } catch (err) {
      console.error(err);
      this.snackBar.open(`Could not import all rights (${this.processing} / ${this.selection.selected.length})`, 'close', { duration: 3000 });
      this.processing = 0;
    }

    this.cdr.markForCheck();
  }

  /**
   * Adds a right to database and prevents multi-insert by refreshing mat-table
   * @param importState
   */
  private async add(importState: RightsImportState, { increment } = { increment: false }) {
    importState.importing = true;
    this.cdr.markForCheck();

    if (importState.rightholders) {
      for (const [waterfallId, rightholders] of Object.entries(importState.rightholders)) {
        const waterfall = await this.waterfallService.getValue(waterfallId);

        const rightholder = importState.right.rightholderId || importState.right.blameId;
        if (rightholder && !waterfall.rightholders.find(r => r.id === rightholder)) {
          waterfall.rightholders.push(rightholders.find(r => r.id === rightholder));
        }

        await this.waterfallService.update(waterfallId, { id: waterfallId, rightholders: waterfall.rightholders });
      }
    }

    if (increment) this.processing++;
    this.cdr.markForCheck();
    const existingRight = await this.rightService.getValue(importState.right.id, { waterfallId: importState.waterfallId });

    const right = importState.right;
    if (existingRight) {
      await this.rightService.update(right, { params: { waterfallId: importState.waterfallId } });
    } else {
      await this.rightService.add(right, { params: { waterfallId: importState.waterfallId } });
    }

    importState.imported = true;

    importState.importing = false;
    this.cdr.markForCheck();
    return true;
  }

  ///////////////////
  // POPINS
  ///////////////////

  displayErrors(importState: RightsImportState) {
    this.dialog.open(ViewImportErrorsComponent, {
      data: createModalData({
        title: `Right id ${importState.right.id}`,
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
  checkboxLabel(row?: RightsImportState): string {
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
  public filterPredicate(data: RightsImportState, filter: string) {
    const dataStr = data.right.id;
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }

}
