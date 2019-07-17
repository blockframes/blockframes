import { Component, Input, ViewChild, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatSnackBar, MatDialog, MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MovieService, MovieAvailability, MovieQuery } from '../../../+state';
import { SelectionModel } from '@angular/cdk/collections';
import { SpreadsheetImportError, MovieAvailabilityWithMetaData } from '../view-extracted-elements/view-extracted-elements.component';
import { ViewImportErrorsComponent } from '../view-import-errors/view-import-errors.component';


@Component({
  selector: 'movie-table-extracted-availabilities',
  templateUrl: './table-extracted-availabilities.component.html',
  styleUrls: ['./table-extracted-availabilities.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableExtractedAvailabilitiesComponent implements OnInit {

  @Input() availabilities : MatTableDataSource<MovieAvailabilityWithMetaData>;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  public selection = new SelectionModel<MovieAvailabilityWithMetaData>(true, []);
  public displayedColumns: string[] = [
    'id',
    'select',
    'movie.title.original',
    'movie.productionYear',
    'movie.directorName',
    'start',
    'end',
    'exclusivity',
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
    this.availabilities.paginator = this.paginator;
    this.availabilities.filterPredicate = this.filterPredicate;
    this.availabilities.sortingDataAccessor = this.sortingDataAccessor;
    this.availabilities.sort = this.sort;
  }

  async addAvailability(availability: MovieAvailabilityWithMetaData) : Promise<void> {
    await this.addMovieAvailabilities(availability);
    this.snackBar.open('Movie availability added!', 'close', { duration: 3000 });
  }

  addSelectedAvailabilities() { // : Promise<boolean>
    // @todo with transaction
  }

  private addMovieAvailabilities(availability: MovieAvailabilityWithMetaData) : Promise<void> {
    const movie  = this.movieQuery.getEntity(availability.movieId);

    //@todo check if unique before add
    //@todo use subcollection ?

    const newAvailability = { ... availability };

    if(newAvailability.errors) delete newAvailability.errors;
    if(newAvailability.movie) delete newAvailability.movie;
    if(newAvailability.movieId) delete newAvailability.movieId;

    const availabilities = [... ( movie.availabilities ? movie.availabilities : [] ), newAvailability ];

    return this.movieService.update(movie.id, { availabilities });
  }

  errorCount(availability: MovieAvailabilityWithMetaData, type: string = 'error') {
    return availability.errors.filter((error: SpreadsheetImportError) => error.type === type ).length;
  }

  ///////////////////
  // POPINS
  ///////////////////

  displayErrors(availability: MovieAvailabilityWithMetaData) {
    this.dialog.open(ViewImportErrorsComponent, { data: { title: availability.movie.title.original, errors: availability.errors} , width: '50%' });
  }

  ///////////////////
  // MAT Table Logic
  ///////////////////

  /**
   * Whether the number of selected elements matches the total number of rows.
   */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.availabilities.data.length;
    return numSelected === numRows;
  }

  /**
   * Selects all rows if they are not all selected; otherwise clear selection.
   */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.availabilities.data.forEach(row => this.selection.select(row));
  }

  /**
   * The label for the checkbox on the passed row
   */
  checkboxLabel(row?: MovieAvailability): string {
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
    this.availabilities.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Specify the fields in which filter is possible.
   * Even for nested objects.
   */
  filterPredicate(data: MovieAvailability, filter) {
    const dataStr = data.movieId + data.start + data.end;
    return dataStr.toLowerCase().indexOf(filter) !== -1; 
  }

}
