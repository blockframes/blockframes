import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Component, Input, ViewChild, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { ViewImportErrorsComponent } from '../view-import-errors/view-import-errors.component';
import { sortingDataAccessor } from '@blockframes/utils/table';
import { MovieImportState, SpreadsheetImportError } from '../../utils';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';

const hasImportErrors = (importState: MovieImportState, type: string = 'error'): boolean => {
  return importState.errors.filter((error: SpreadsheetImportError) => error.type === type).length !== 0;
};

@Component({
  selector: 'import-table-extracted-movies',
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableExtractedMoviesComponent implements OnInit {

  @Input() rows: MatTableDataSource<MovieImportState>;
  @Input() mode: string;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  public processing = 0;
  public selection = new SelectionModel<MovieImportState>(true, []);
  public displayedColumns: string[] = [
    'movie.internalRef',
    'select',
    'movie.title.original',
    'errors',
    'warnings',
    'actions',
  ];

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private movieService: MovieService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // Mat table setup @TODO #7429
    this.rows.paginator = this.paginator;
    this.rows.filterPredicate = this.filterPredicate;
    this.rows.sortingDataAccessor = sortingDataAccessor;
    this.rows.sort = this.sort;
  }

  async create(importState: MovieImportState) {
    await this.add(importState);
    this.snackBar.open('Title created!', 'close', { duration: 3000 });
  }

  async createSelected() {
    try {
      const creations = this.selection.selected.filter(importState => !importState.movie.id && !hasImportErrors(importState));
      for (const movie of creations) {
        await this.add(movie, { increment: true });
      }
      this.snackBar.open(`${this.processing} titles created!`, 'close', { duration: 3000 });
      this.processing = 0;
    } catch (err) {
      this.snackBar.open(`Could not create all titles (${this.processing} / ${this.selection.selected.length})`, 'close', { duration: 3000 });
      this.processing = 0;
    }

    this.cdr.markForCheck();
  }

  /**
   * Adds a movie to database and prevents multi-insert by refreshing mat-table
   * @param importState
   */
  private async add(importState: MovieImportState, { increment } = { increment: false }) {
    if (increment) this.processing++;
    importState.importing = true;
    this.cdr.markForCheck();
    const data = this.rows.data;
    importState.movie = await this.movieService.create(importState.movie);
    importState.errors.push({
      type: 'error',
      name: 'Film Code',
      reason: 'Movie already exists',
      message: 'Movie already saved'
    });
    this.rows.data = data;

    importState.importing = false;
    this.cdr.markForCheck();
  }

  async update(importState: MovieImportState) {
    await this.upsert(importState);
    this.snackBar.open('Movie updated!', 'close', { duration: 3000 });
    return true;
  }

  async updateSelected() {
    try {
      const updates = this.selection.selected.filter(importState => importState.movie.id && !hasImportErrors(importState));
      for (const importState of updates) {
        await this.upsert(importState, { increment: true });
      }
      this.snackBar.open(`${this.processing} movies updated!`, 'close', { duration: 3000 });
      this.processing = 0;
    } catch (err) {
      this.snackBar.open(`Could not update all titles (${this.processing} / ${this.selection.selected.length})`, 'close', { duration: 3000 });
      this.processing = 0;
    }
    this.cdr.markForCheck();
  }

  private async upsert(importState: MovieImportState, { increment } = { increment: false }) {
    if (increment) this.processing++;
    importState.importing = true;
    this.cdr.markForCheck();
    await this.movieService.upsert(importState.movie); // TODO #7273 #8280 test if working ok wihtout removeNulls
    importState.importing = false;
    this.cdr.markForCheck();
  }

  ///////////////////
  // POPINS
  ///////////////////

  displayErrors(data: MovieImportState) {
    this.dialog.open(ViewImportErrorsComponent, {
      data: createModalData({ title: data.movie.title.original, errors: data.errors })
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
      : this.rows.data.forEach(row => this.selection.select(row));
  }

  /**
   * The label for the checkbox on the passed row
   */
  checkboxLabel(row?: MovieImportState): string {
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
  public filterPredicate(data: MovieImportState, filter: string) {
    const dataStr = data.movie.internalRef + data.movie.title.original;
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }

}
