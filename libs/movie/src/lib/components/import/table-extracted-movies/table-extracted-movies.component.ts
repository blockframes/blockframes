import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Component, Input, ViewChild, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Movie, MovieService } from '../../../+state';
import { PreviewMovieComponent } from './../preview-movie/preview-movie.component';
import { SelectionModel } from '@angular/cdk/collections';
import { MovieImportState, SpreadsheetImportError } from '../view-extracted-elements/view-extracted-elements.component';
import { ViewImportErrorsComponent } from '../view-import-errors/view-import-errors.component';


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
  public processedMovies = 0;

  public selection = new SelectionModel<MovieImportState>(true, []);
  public displayedColumns: string[] = [
    'movie.main.internalRef',
    'select',
    'movie.main.title.original',
    'movie.main.poster',
    'movie.main.productionYear',
    'errors',
    'warnings',
    'actions',
    'preview',
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
    this.rows.sortingDataAccessor = this.sortingDataAccessor;
    this.rows.sort = this.sort;
  }

  async createMovie(importState: MovieImportState): Promise<boolean> {
    const data = this.rows.data;
    await this.addMovie(importState);
    this.rows.data = data;
    this.snackBar.open('Movie created!', 'close', { duration: 3000 });
    return true;
  }

  async createSelectedMovies(): Promise<boolean> {
    try {
      const creations = this.selection.selected.filter(importState => !importState.movie.id && !hasImportErrors(importState));
      for (const movie of creations) { // @TODO #1389
        this.processedMovies++;
        await this.addMovie(movie);
      }
      this.snackBar.open(`${this.processedMovies} movies created!`, 'close', { duration: 3000 });
      this.processedMovies = 0;
      return true;
    } catch (err) {
      this.snackBar.open(`Could not create all movies (${this.processedMovies} / ${this.selection.selected})`, 'close', { duration: 3000 });
      this.processedMovies = 0;
    }
  }

  /**
   * Adds a movie to database and prevents multi-insert by refreshing mat-table
   * @param importState 
   */
  private async addMovie(importState: MovieImportState): Promise<boolean> {
    const data = this.rows.data;
    await this.movieService.addMovie(importState.movie.main.title.original, importState.movie);
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

  async updateMovie(importState: MovieImportState) {
    await this.movieService.updateById(importState.movie.id, importState.movie)
    this.snackBar.open('Movie updated!', 'close', { duration: 3000 });
    return true;
  }

  async updateSelectedMovies(): Promise<boolean> {
    try {
      const updates = this.selection.selected.filter(importState => importState.movie.id && !hasImportErrors(importState));
      for (const importState of updates) { // @TODO #1389
        this.processedMovies++;
        await this.movieService.updateById(importState.movie.id, importState.movie);
      }
      this.snackBar.open(`${this.processedMovies} movies updated!`, 'close', { duration: 3000 });
      this.processedMovies = 0;
      return true;
    } catch (err) {
      this.snackBar.open(`Could not update all movies (${this.processedMovies} / ${this.selection.selected})`, 'close', { duration: 3000 });
      this.processedMovies = 0;
    }
  }

  errorCount(data: MovieImportState, type: string = 'error') {
    return data.errors.filter((error: SpreadsheetImportError) => error.type === type).length;
  }

  ///////////////////
  // POPINS
  ///////////////////

  previewMovie(movie: Movie) {
    this.dialog.open(PreviewMovieComponent, { data: movie });
  }

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
    this.isAllSelected() ?
      this.selection.clear() :
      this.rows.data.forEach(row => this.selection.select(row));
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
  filterPredicate(data: MovieImportState, filter) {
    const dataStr = data.movie.main.internalRef + data.movie.main.title.original + data.movie.main.productionYear;
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }

}
