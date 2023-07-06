import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Component, Input, ViewChild, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { ViewImportErrorsComponent } from '../view-import-errors/view-import-errors.component';
import { sortingDataAccessor } from '@blockframes/utils/table';
import { DocumentsImportState, SpreadsheetImportError } from '../../utils';
import { TermService } from '@blockframes/contract/term/service';
import { isContract, WaterfallDocument } from '@blockframes/model';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { WaterfallDocumentsService } from '@blockframes/waterfall/documents.service';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';

const hasImportErrors = (importState: DocumentsImportState, type: string = 'error'): boolean => {
  return importState.errors.filter((error: SpreadsheetImportError) => error.type === type).length !== 0;
};

@Component({
  selector: 'import-table-extracted-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableExtractedDocumentsComponent implements AfterViewInit {

  @Input() rows: MatTableDataSource<DocumentsImportState>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  public processing = 0;

  public selection = new SelectionModel<DocumentsImportState>(true, []);
  public displayedColumns: string[] = [
    'id',
    'select',
    'document.id',
    'document.type',
    'errors',
    'warnings',
    'actions',
  ];

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private waterfallDocumentsService: WaterfallDocumentsService,
    private waterfallService: WaterfallService,
    private termService: TermService,
    private cdr: ChangeDetectorRef
  ) { }

  ngAfterViewInit(): void {
    this.rows.paginator = this.paginator;
    this.rows.filterPredicate = this.filterPredicate;
    this.rows.sortingDataAccessor = sortingDataAccessor;
    this.rows.sort = this.sort;
  }

  async create(importState: DocumentsImportState) {
    await this.add(importState);
    this.snackBar.open('Document added!', 'close', { duration: 9000 });
  }

  async createSelected() {
    try {
      const creations = this.selection.selected.filter(importState => !hasImportErrors(importState));
      for (const document of creations) {
        await this.add(document, { increment: true });
      }

      const text = this.processing === creations.length
        ? `${creations.length}/${creations.length} document(s) created!`
        : `Could not import all documents (${this.processing} / ${this.selection.selected.length})`;
      this.snackBar.open(text, 'close', { duration: 3000 });

      this.processing = 0;
    } catch (err) {
      console.error(err);
      this.snackBar.open(`Could not import all documents (${this.processing} / ${this.selection.selected.length})`, 'close', { duration: 3000 });
      this.processing = 0;
    }

    this.cdr.markForCheck();
  }

  /**
   * Adds a document to database and prevents multi-insert by refreshing mat-table
   * @param importState
   */
  private async add(importState: DocumentsImportState, { increment } = { increment: false }) {
    importState.importing = true;
    this.cdr.markForCheck();

    if (isContract(importState.document)) {

      const contract = importState.document.meta;
      contract.termIds = importState.terms.map(t => t.id);

      if (importState.rightholders) {
        for (const [waterfallId, rightholders] of Object.entries(importState.rightholders)) {
          const waterfall = await this.waterfallService.getValue(waterfallId);

          if (!waterfall.rightholders.find(r => r.id === contract.buyerId)) {
            waterfall.rightholders.push(rightholders.find(r => r.id === contract.buyerId));
          }

          if (!waterfall.rightholders.find(r => r.id === contract.sellerId)) {
            waterfall.rightholders.push(rightholders.find(r => r.id === contract.sellerId));
          }

          await this.waterfallService.update(waterfallId, { id: waterfallId, rightholders: waterfall.rightholders });
        }
      }
    };



    if (increment) this.processing++;
    this.cdr.markForCheck();

    await this.waterfallDocumentsService.add<WaterfallDocument>(importState.document, { params: { waterfallId: importState.document.waterfallId } });

    // @dev: Create terms after document because rules require document to be created first
    await this.termService.add(importState.terms);

    importState.imported = true;

    importState.importing = false;
    this.cdr.markForCheck();
    return true;
  }

  ///////////////////
  // POPINS
  ///////////////////

  displayErrors(importState: DocumentsImportState) {
    this.dialog.open(ViewImportErrorsComponent, {
      data: createModalData({
        title: `Document id ${importState.document.id}`,
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
  checkboxLabel(row?: DocumentsImportState): string {
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
  public filterPredicate(data: DocumentsImportState, filter: string) {
    const dataStr = data.document.id;
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }

}
