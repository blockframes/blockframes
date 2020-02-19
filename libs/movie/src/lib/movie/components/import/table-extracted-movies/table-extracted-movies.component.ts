import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Component, Input, ViewChild, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MovieService } from '../../../+state';
import { SelectionModel } from '@angular/cdk/collections';
import { MovieImportState, SpreadsheetImportError } from '../view-extracted-elements/view-extracted-elements.component';
import { ViewImportErrorsComponent } from '../view-import-errors/view-import-errors.component';
import { sortingDataAccessor } from '@blockframes/utils/table';
import { StoreStatus } from '@blockframes/movie/movie/+state/movie.firestore';

const hasImportErrors = (importState: MovieImportState, type: string = 'error'): boolean => {
  return importState.errors.filter((error: SpreadsheetImportError) => error.type === type).length !== 0;
};

@Component({
  selector: 'movie-table-extracted-movies',
  templateUrl: './table-extracted-movies.component.html',
  styleUrls: ['./table-extracted-movies.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableExtractedMoviesComponent implements OnInit {

  @Input() rows: MatTableDataSource<MovieImportState>;
  @Input() mode: string;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  public processedTitles = 0;
  public submittedTitles = 0;

  public selection = new SelectionModel<MovieImportState>(true, []);
  public displayedColumns: string[] = [
    'movie.main.internalRef',
    'select',
    'movie.main.title.original',
    'movie.promotionalElements.poster',
    'movie.main.productionYear',
    'movie.main.storeConfig.status',
    'movie.main.storeConfig.storeType',
    'errors',
    'warnings',
    'actions',
  ];

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private movieService: MovieService,
  ) { }

  ngOnInit() {
    // Mat table setup
    this.rows.paginator = this.paginator;
    this.rows.filterPredicate = this.filterPredicate;
    this.rows.sortingDataAccessor = sortingDataAccessor;
    this.rows.sort = this.sort;
  }

  async createMovie(importState: MovieImportState): Promise<boolean> {
    await this.addMovie(importState);
    this.snackBar.open('Title created!', 'close', { duration: 3000 });
    return true;
  }

  /**
 * @dev Once created (as draft), titls can be submitted to Archipel Content
 */
  async submitMovie(importState: MovieImportState): Promise<boolean> {
    await this.submitToArchipelContent(importState);
    this.snackBar.open('Title submitted !', 'close', { duration: 3000 });
    return true;
  }

  async createSelectedMovies(): Promise<boolean> {
    try {
      const creations = this.selection.selected.filter(importState => !importState.movie.id && !hasImportErrors(importState));
      for (const movie of creations) {
        this.processedTitles++;
        await this.addMovie(movie);
      }
      this.snackBar.open(`${this.processedTitles} titles created!`, 'close', { duration: 3000 });
      this.processedTitles = 0;
      return true;
    } catch (err) {
      this.snackBar.open(`Could not create all titles (${this.processedTitles} / ${this.selection.selected.length})`, 'close', { duration: 3000 });
      this.processedTitles = 0;
    }
  }

  /**
   * @dev Once created (as draft), titles can be submitted to Archipel Content
   */
  async submitSelectedMovies(): Promise<boolean> {
    try {
      const creations = this.selection.selected.filter(importState => importState.movie.id && !hasImportErrors(importState) && this.isTitleValidForSubmit(importState));
      for (const movie of creations) {
        this.submittedTitles++;
        await this.submitToArchipelContent(movie);
      }
      this.snackBar.open(`${this.submittedTitles} titles submitted!`, 'close', { duration: 3000 });
      this.submittedTitles = 0;
      return true;
    } catch (err) {
      this.snackBar.open(`Could not submit all titles (${this.submittedTitles} / ${this.selection.selected.length})`, 'close', { duration: 3000 });
      this.submittedTitles = 0;
    }
  }

  /**
   * Adds a movie to database and prevents multi-insert by refreshing mat-table
   * @param importState 
   */
  private async addMovie(importState: MovieImportState): Promise<boolean> {
    const data = this.rows.data;
    const { id } = await this.movieService.addMovie(importState.movie.main.title.original, importState.movie);
    importState.movie.id = id;
    importState.errors.push({
      type: 'error',
      field: 'main.internalRef',
      name: 'Film Code',
      reason: 'Movie already exists',
      hint: 'Movie already saved'
    });
    this.rows.data = data;
    return true;
  }

  /**
   * Change title status from 'Draft' to 'Submitted to Archipel Content'
   * @param importState 
   */
  private async submitToArchipelContent(importState: MovieImportState): Promise<boolean> {
    const data = this.rows.data;
    importState.movie.main.storeConfig.status = StoreStatus.submitted;
    await this.movieService.updateById(importState.movie.id, importState.movie);
    this.rows.data = data;
    return true;
  }

  public isTitleValidForSubmit(importState: MovieImportState): boolean {
    // Already valid or submitted
    if (
      importState.movie.main.storeConfig.status === StoreStatus.submitted ||
      importState.movie.main.storeConfig.status === StoreStatus.accepted) {
      return false;
    }

    return true;
  }

  async updateMovie(importState: MovieImportState) {
    await this.movieService.updateById(importState.movie.id, importState.movie)
    this.snackBar.open('Movie updated!', 'close', { duration: 3000 });
    return true;
  }

  async updateSelectedMovies(): Promise<boolean> {
    try {
      const updates = this.selection.selected.filter(importState => importState.movie.id && !hasImportErrors(importState));
      for (const importState of updates) { // @TODO #1389
        this.processedTitles++;
        await this.movieService.updateById(importState.movie.id, importState.movie);
      }
      this.snackBar.open(`${this.processedTitles} movies updated!`, 'close', { duration: 3000 });
      this.processedTitles = 0;
      return true;
    } catch (err) {
      this.snackBar.open(`Could not update all titles (${this.processedTitles} / ${this.selection.selected.length})`, 'close', { duration: 3000 });
      this.processedTitles = 0;
    }
  }

  errorCount(data: MovieImportState, type: string = 'error') {
    return data.errors.filter((error: SpreadsheetImportError) => error.type === type).length;
  }

  ///////////////////
  // POPINS
  ///////////////////

  displayErrors(data: MovieImportState) {
    this.dialog.open(ViewImportErrorsComponent, { data: { title: data.movie.main.title.original, errors: data.errors }, width: '50%' });
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
  filterPredicate(data: MovieImportState, filter) {
    const dataStr = data.movie.main.internalRef + data.movie.main.title.original + data.movie.main.productionYear;
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }

}
