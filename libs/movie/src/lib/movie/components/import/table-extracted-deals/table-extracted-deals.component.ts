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
import { DistributionDealService } from '@blockframes/movie/distribution-deals/+state/distribution-deal.service';
import { cleanModel } from '@blockframes/utils/helpers';
import { Terms } from '@blockframes/utils/common-interfaces/terms';
import { DatePipe } from '@angular/common';

const hasImportErrors = (importState: DealsImportState, type: string = 'error'): boolean => {
  return importState.errors.filter((error: SpreadsheetImportError) => error.type === type).length !== 0;
};

@Component({
  selector: 'movie-table-extracted-deals',
  templateUrl: './table-extracted-deals.component.html',
  styleUrls: ['./table-extracted-deals.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe]
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
    private movieService: MovieService,
    private datepipe: DatePipe
  ) { }

  ngOnInit() {
    // Mat table setup
    this.rows.paginator = this.paginator;
    this.rows.filterPredicate = this.filterPredicate;
    this.rows.sortingDataAccessor = this.sortingDataAccessor;
    this.rows.sort = this.sort;
  }

  async createDeal(importState: DealsImportState): Promise<boolean> {
    await this.addDeal(importState);
    this.snackBar.open('Distribution deal added!', 'close', { duration: 3000 });
    return true;
  }

  async createSelectedDeals(): Promise<boolean> {
    try {
      const creations = this.selection.selected.filter(importState => !hasImportErrors(importState));
      for (const contract of creations) {
        this.processedDeals++;
        await this.addDeal(contract);
      }
      this.snackBar.open(`${this.processedDeals} deals created!`, 'close', { duration: 3000 });
      this.processedDeals = 0;
      return true;
    } catch (err) {
      this.snackBar.open(`Could not import all deals (${this.processedDeals} / ${this.selection.selected})`, 'close', { duration: 3000 });
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
      await this.distributionDealService.addDistributionDeal(this.movies[importState.movieInternalRef].id, importState.distributionDeal, importState.contract);
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

  toPrettyDate(term: Terms, type: 'start' | 'end' = 'start'): string {
    const noDate = 'no date';
    switch (type) {
      case 'start':
        if (!term.start || isNaN(term.start.getTime())) {
          return term.startLag ? term.startLag : noDate;
        } else if (term.start) {
          return this.datepipe.transform(term.start, 'yyyy-MM-dd');;
        } else {
          return noDate;
        }
      case 'end':
      default:
        if (!term.end || isNaN(term.end.getTime())) {
          return term.endLag ? term.endLag : noDate;
        } else if (term.end) {
          return this.datepipe.transform(term.end, 'yyyy-MM-dd');;
        } else {
          return noDate;
        }
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
    const dataStr = data.movieInternalRef + data.movieTitle + data.distributionDeal.terms.start + data.distributionDeal.terms.end + data.distributionDeal.id;
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }

}
