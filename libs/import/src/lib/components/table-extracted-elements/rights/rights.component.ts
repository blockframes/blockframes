import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Component, Input, ViewChild, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { ViewImportErrorsComponent } from '../view-import-errors/view-import-errors.component';
import { DistributionRightService } from '@blockframes/distribution-rights/+state/distribution-right.service';
import { cleanModel } from '@blockframes/utils/helpers';
import { sortingDataAccessor } from '@blockframes/utils/table';
import { RightsImportState, SpreadsheetImportError } from '../../../import-utils';
import { MovieService, createMovie } from '@blockframes/movie/+state';

const hasImportErrors = (importState: RightsImportState, type: string = 'error'): boolean => {
  return importState.errors.filter((error: SpreadsheetImportError) => error.type === type).length !== 0;
};

@Component({
  selector: 'import-table-extracted-rights',
  templateUrl: './rights.component.html',
  styleUrls: ['./rights.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableExtractedRightsComponent implements OnInit {

  @Input() rows: MatTableDataSource<RightsImportState>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  private movies: any = {};
  public processedRights = 0;
  public selection = new SelectionModel<RightsImportState>(true, []);
  public displayedColumns: string[] = [
    'id',
    'select',
    'movieInternalRef',
    'distributionRight.id',
    'movieTitle',
    'distributionRight.terms.start',
    'distributionRight.terms.end',
    'distributionRight.exclusive',
    'errors',
    'warnings',
    'actions',
  ];

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private distributionRightService: DistributionRightService,
    private movieService: MovieService
  ) { }

  ngOnInit() {
    // Mat table setup
    this.rows.paginator = this.paginator;
    this.rows.filterPredicate = this.filterPredicate;
    this.rows.sortingDataAccessor = sortingDataAccessor;
    this.rows.sort = this.sort;
  }

  async createRight(importState: RightsImportState): Promise<boolean> {
    const output = await this.addRight(importState);
    if(output) {
      this.snackBar.open('Distribution right added!', 'close', { duration: 3000 });
    } else {
      this.snackBar.open('Error while adding distribution right', 'close', { duration: 3000 });
    }

    return true;
  }

  async createSelectedRights(): Promise<boolean> {
    try {
      const creations = this.selection.selected.filter(importState => !hasImportErrors(importState));
      for (const contract of creations) {
        const output = await this.addRight(contract);
        if(output) this.processedRights ++;
      }
      this.snackBar.open(`${this.processedRights} rights created!`, 'close', { duration: 3000 });
      this.processedRights = 0;
      return true;
    } catch (err) {
      this.snackBar.open(`Could not import all rights (${this.processedRights} / ${this.selection.selected.length})`, 'close', { duration: 3000 });
      this.processedRights = 0;
    }
  }

  /**
   * Adds a right to database and prevents multi-insert by refreshing mat-table
   * @param importState
   */
  private async addRight(importState: RightsImportState): Promise<boolean> {
    const data = this.rows.data;
    try {
      if (!this.movies[importState.movieInternalRef]) {
        const existingMovie = await this.movieService.getFromInternalRef(importState.movieInternalRef);
        this.movies[importState.movieInternalRef] = createMovie(cleanModel(existingMovie));
      }
      await this.distributionRightService.add(importState.distributionRight, { params: { movieId : this.movies[importState.movieInternalRef].id } });
      importState.errors.push({
        type: 'error',
        field: 'distributionRight',
        name: 'Distribution right',
        reason: 'Distribution right already added',
        hint: 'Distribution right already added'
      });

      this.rows.data = data;
      return true;
    } catch (error) {
      importState.errors.push({
        type: 'error',
        field: 'distributionRight',
        name: 'Distribution right',
        reason: 'Error while adding distribution right to DB',
        hint: 'Contact an administrator'
      });
      return false;
    }

  }

  errorCount(data: RightsImportState, type: string = 'error') {
    return data.errors.filter((error: SpreadsheetImportError) => error.type === type).length;
  }

  ///////////////////
  // POPINS
  ///////////////////

  displayErrors(importState: RightsImportState) {
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
    const dataStr = data.movieInternalRef + data.movieTitle + data.distributionRight.terms.start + data.distributionRight.terms.end + data.distributionRight.id;
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }

}
