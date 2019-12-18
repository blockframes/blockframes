import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Component, Input, ViewChild, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MovieService, MovieQuery, cleanModel, createMovie } from '../../../+state';
import { SelectionModel } from '@angular/cdk/collections';
import { SpreadsheetImportError, DealsImportState } from '../view-extracted-elements/view-extracted-elements.component';
import { ViewImportErrorsComponent } from '../view-import-errors/view-import-errors.component';

const hasImportErrors = (importState: DealsImportState, type: string = 'error'): boolean => {
  return importState.errors.filter((error: SpreadsheetImportError) => error.type === type).length !== 0;
};

@Component({
  selector: 'movie-table-extracted-deals',
  templateUrl: './table-extracted-deals.component.html',
  styleUrls: ['./table-extracted-deals.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableExtractedDealsComponent implements OnInit {

  @Input() rows: MatTableDataSource<DealsImportState>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  public selection = new SelectionModel<DealsImportState>(true, []);
  public displayedColumns: string[] = [
    'id',
    'select',
    'movieInternalRef',
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

  async createDeal(importState: DealsImportState): Promise<boolean> {
    const existingMovie = this.movieQuery.existingMovie(importState.movieInternalRef);
    const data = this.rows.data;

    await this.movieService.addDistributionDeal(existingMovie.id, importState.distributionDeal, importState.contract);
    importState.errors.push({
      type: 'error',
      field: 'distributionDeal',
      name: 'Distribution deal',
      reason: 'Distribution deal already added',
      hint: 'Distribution deal already added'
    });
    this.rows.data = data;
    this.snackBar.open('Distribution deal added!', 'close', { duration: 3000 });
    return true;
  }

  async createSelectedDeals(): Promise<boolean> {
    try {
      const data = this.rows.data;
      const movies = {};
      const promises = [];
      this.selection.selected
        .filter(importState => !hasImportErrors(importState))
        .map(importState => {

          if (!movies[importState.movieInternalRef]) {
            const existingMovie = this.movieQuery.existingMovie(importState.movieInternalRef);
            movies[importState.movieInternalRef] = createMovie(cleanModel(existingMovie));
          }
          importState.errors.push({
            type: 'error',
            field: 'distributionDeal',
            name: 'Distribution deal',
            reason: 'Distribution deal already added',
            hint: 'Distribution deal already added'
          });

          return promises.push(this.movieService.addDistributionDeal(movies[importState.movieInternalRef].id, importState.distributionDeal, importState.contract));
        });
      this.rows.data = data;

      await Promise.all(promises); // @TODO #1389
      this.snackBar.open(`${promises.length} distribution deals inserted!`, 'close', { duration: 3000 });
      return true;
    } catch (err) {
      this.snackBar.open(`Could not insert distribution deals`, 'close', { duration: 3000 });
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
    this.isAllSelected() ?
      this.selection.clear() :
      this.rows.data.forEach(row => this.selection.select(row));
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
  filterPredicate(data: DealsImportState, filter) {
    const dataStr = data.movieInternalRef + data.movieTitle + data.distributionDeal.terms.start + data.distributionDeal.terms.end;
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }

}
