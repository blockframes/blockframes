import { Component, Input, ViewChild, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatSnackBar, MatDialog, MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { Movie, MovieService } from '../../../+state';
import { PreviewMovieComponent } from './../preview-movie/preview-movie.component';
import { Observable } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { MovieWithMetaData, ExcelImportError } from '../view-extracted-elements/view-extracted-elements.component';
import { ViewImportErrorsComponent } from '../view-import-errors/view-import-errors.component';


@Component({
  selector: 'movie-table-extracted-movies',
  templateUrl: './table-extracted-movies.component.html',
  styleUrls: ['./table-extracted-movies.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableExtractedMoviesComponent implements OnInit {

  @Input() movies: MatTableDataSource<MovieWithMetaData>;
  @Input() mode: string;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  public defaultPoster = 'https://cdn.wpformation.com/wp-content/uploads/2014/03/todo1.jpg';
  public selection = new SelectionModel<MovieWithMetaData>(true, []);
  public displayedColumns: string[] = [
    'id',
    'select',
    'title.original',
    'poster',
    'productionYear',
    'directorName',
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
    this.movies.paginator = this.paginator;
    this.movies.filterPredicate = this.filterPredicate;
    this.movies.sortingDataAccessor = this.sortingDataAccessor;
    this.movies.sort = this.sort;
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
    this.selection.selected.forEach((movie: MovieWithMetaData) => {
      if (movie.id === undefined && this.errorCount(movie) === 0) {
        moviesToCreate.push(this.addMovie(movie));
      }
    })

    return Promise.all(moviesToCreate).then(() => {
      this.snackBar.open(`${moviesToCreate.length} movies created!`, 'close', { duration: 3000 });
      return true;
    });
  }

  private addMovie(movie: Movie): Promise<void> {
    return this.movieService.add(movie.title.original, true)
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

  errorCount(movie: MovieWithMetaData, type: string = 'error') {
    return movie.errors.filter((error: ExcelImportError) => error.type === type).length;
  }

  ///////////////////
  // POPINS
  ///////////////////

  previewMovie(movie: Movie) {
    this.dialog.open(PreviewMovieComponent, { data: movie });
  }

  displayErrors(movie: MovieWithMetaData) {
    this.dialog.open(ViewImportErrorsComponent, { data: { title: movie.title.original, errors: movie.errors }, width: '50%' });
  }

  ///////////////////
  // MAT Table Logic
  ///////////////////

  /**
   * Whether the number of selected elements matches the total number of rows.
   */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.movies.data.length;
    return numSelected === numRows;
  }

  /**
   * Selects all rows if they are not all selected; otherwise clear selection.
   */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.movies.data.forEach(row => this.selection.select(row));
  }

  /**
   * The label for the checkbox on the passed row
   */
  checkboxLabel(row?: Movie): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
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
    this.movies.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Specify the fields in which filter is possible.
   * Even for nested objects.
   */
  filterPredicate(data: Movie, filter) {
    const dataStr = data.title.original + data.productionYear + data.directorName;
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }

}
