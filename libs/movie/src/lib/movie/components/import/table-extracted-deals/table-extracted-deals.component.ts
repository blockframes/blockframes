import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Component, Input, ViewChild, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { createMovie, MovieService } from '../../../+state';
import { SelectionModel } from '@angular/cdk/collections';
import { SpreadsheetImportError, DealsImportState } from '../view-extracted-elements/view-extracted-elements.component';
import { ViewImportErrorsComponent } from '../view-import-errors/view-import-errors.component';
import { DistributionDealService } from '@blockframes/distribution-deals/+state/distribution-deal.service';
import { cleanModel } from '@blockframes/utils/helpers';
import { sortingDataAccessor } from '@blockframes/utils/table';

const hasImportErrors = (importState: DealsImportState, type: string = 'error'): boolean => {
  return importState.errors.filter((error: SpreadsheetImportError) => error.type === type).length !== 0;
};

@Component({
  selector: 'movie-table-extracted-deals',
  templateUrl: './table-extracted-deals.component.html',
  styleUrls: ['./table-extracted-deals.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableExtractedDealsComponent implements OnInit {

  @Input() rows: MatTableDataSource<DealsImportState>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  private movies: any = {};
  public processedDeals = 0;
  public selection = new SelectionModel<DealsImportState>(true, []);
  public displayedColumns: string[] = [
    'id',
    'select',
    'movieInternalRef',
    'distributionDeal.id',
    'movieTitle',
    'distributionDeal.terms.start',
    'distributionDeal.terms.end',
    'distributionDeal.exclusive',
    'errors',
    'warnings',
    'actions',
  ];

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private distributionDealService: DistributionDealService,
    private movieService: MovieService
  ) { }

  ngOnInit() {
    // Mat table setup
    this.rows.paginator = this.paginator;
    this.rows.filterPredicate = this.filterPredicate;
    this.rows.sortingDataAccessor = sortingDataAccessor;
    this.rows.sort = this.sort;
  }

  async createDeal(importState: DealsImportState): Promise<boolean> {
    const output = await this.addDeal(importState);
    if(output) {
      this.snackBar.open('Distribution deal added!', 'close', { duration: 3000 });
    } else {
      this.snackBar.open('Error while adding distribution deal', 'close', { duration: 3000 });
    }

    return true;
  }

  async createSelectedDeals(): Promise<boolean> {
    try {
      const creations = this.selection.selected.filter(importState => !hasImportErrors(importState));
      for (const contract of creations) {
        const output = await this.addDeal(contract);
        if(output) this.processedDeals ++;
      }
      this.snackBar.open(`${this.processedDeals} deals created!`, 'close', { duration: 3000 });
      this.processedDeals = 0;
      return true;
    } catch (err) {
      this.snackBar.open(`Could not import all deals (${this.processedDeals} / ${this.selection.selected.length})`, 'close', { duration: 3000 });
      this.processedDeals = 0;
    }
  }

  /**
   * Adds a deal to database and prevents multi-insert by refreshing mat-table
   * @param importState
   */
  private async addDeal(importState: DealsImportState): Promise<boolean> {
    const data = this.rows.data;
    try {
      if (!this.movies[importState.movieInternalRef]) {
        const existingMovie = await this.movieService.getFromInternalRef(importState.movieInternalRef);
        this.movies[importState.movieInternalRef] = createMovie(cleanModel(existingMovie));
      }
      await this.distributionDealService.addDistributionDeal(this.movies[importState.movieInternalRef].id, importState.distributionDeal);
      importState.errors.push({
        type: 'error',
        field: 'distributionDeal',
        name: 'Distribution deal',
        reason: 'Distribution deal already added',
        hint: 'Distribution deal already added'
      });

      this.rows.data = data;
      return true;
    } catch (error) {
      importState.errors.push({
        type: 'error',
        field: 'distributionDeal',
        name: 'Distribution deal',
        reason: 'Error while adding distribution deal to DB',
        hint: 'Contact an administrator'
      });
      return false;
    }

  }

  errorCount(data: DealsImportState, type: string = 'error') {
    return data.errors.filter((error: SpreadsheetImportError) => error.type === type).length;
  }

  ///////////////////
  // POPINS
  ///////////////////

  displayErrors(importState: DealsImportState) {
    const data = { title: importState.movieTitle ? importState.movieTitle : '--', errors: importState.errors };
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
  checkboxLabel(row?: DealsImportState): string {
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
  public filterPredicate(data: DealsImportState, filter: string) {
    const dataStr = data.movieInternalRef + data.movieTitle + data.distributionDeal.terms.start + data.distributionDeal.terms.end + data.distributionDeal.id;
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }

}
