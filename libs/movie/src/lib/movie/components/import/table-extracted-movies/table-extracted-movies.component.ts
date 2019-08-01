import { Component, Input, ViewChild, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatSnackBar, MatDialog, MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { Movie, MovieService } from '../../../+state';
import { PreviewMovieComponent } from './../preview-movie/preview-movie.component';
import { SelectionModel } from '@angular/cdk/collections';
import { MovieImportState, SpreadsheetImportError } from '../view-extracted-elements/view-extracted-elements.component';
import { ViewImportErrorsComponent } from '../view-import-errors/view-import-errors.component';


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

  public defaultPoster = 'https://cdn.wpformation.com/wp-content/uploads/2014/03/todo1.jpg';
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

  createMovie(movie: Movie): Promise<boolean> {
    return this.addMovie(movie)
      .then(() => {
        this.snackBar.open('Movie created!', 'close', { duration: 3000 });
        return true;
      });
  }

  createSelectedMovies(): Promise<boolean> {
    const moviesToCreate = [];
    this.selection.selected.forEach((data: MovieImportState) => {
      if (data.movie.id === undefined && this.errorCount(data) === 0) {
        moviesToCreate.push(this.addMovie(data.movie));
      }
    })

    return Promise.all(moviesToCreate).then(() => {
      this.snackBar.open(`${moviesToCreate.length} movies created!`, 'close', { duration: 3000 });
      return true;
    });
  }

  private addMovie(movie: Movie): Promise<void> {
    return this.movieService.addMovie(movie.main.title.original)
      .then(({ id }) => {
        movie.id = id;
        return this.movieService.update(id, JSON.parse(JSON.stringify(movie))); //@todo remove #483
      });
  }

  updateSelectedMovies() { // : Promise<boolean>
    // @todo
  }

  updateMovie(movie: Movie) {
    console.log(`todo ${movie.id}`);
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
