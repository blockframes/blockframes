import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Component, Input, ViewChild, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { ViewImportErrorsComponent } from '../view-import-errors/view-import-errors.component';
import { sortingDataAccessor } from '@blockframes/utils/table';
import { MovieImportState, SpreadsheetImportError } from '../../../import-utils';
import { MovieService } from '@blockframes/movie/+state';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { ContractService } from '@blockframes/contract/contract/+state/contract.service';
import { createContract, createContractPartyDetail } from '@blockframes/contract/contract/+state/contract.model';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { getCurrentApp, App, getMoviePublishStatus } from '@blockframes/utils/apps';

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
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  public processedTitles = 0;
  public publishedTitles = 0;
  public currentApp: App;
  public selection = new SelectionModel<MovieImportState>(true, []);
  public displayedColumns: string[] = [
    'movie.main.internalRef',
    'select',
    'movie.main.title.original',
    'movie.promotionalElements.poster',
    'movie.main.productionYear',
    'errors',
    'warnings',
    'actions',
  ];

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private movieService: MovieService,
    private contractService: ContractService,
    private orgQuery: OrganizationQuery,
    private routerQuery: RouterQuery
  ) { }

  ngOnInit() {
    // Mat table setup
    this.rows.paginator = this.paginator;
    this.rows.filterPredicate = this.filterPredicate;
    this.rows.sortingDataAccessor = sortingDataAccessor;
    this.rows.sort = this.sort;
    this.currentApp = getCurrentApp(this.routerQuery);
  }

  async createMovie(importState: MovieImportState): Promise<boolean> {
    await this.addMovie(importState);
    this.snackBar.open('Title created!', 'close', { duration: 3000 });
    return true;
  }

  /**
    * @dev Once created (as draft), depending on the app, titles can be submitted to Archipel Content or accepted (ndlr: published) directly
   */
  async publishMovie(importState: MovieImportState): Promise<boolean> {
    await this.publish(importState);
    this.snackBar.open('Title published !', 'close', { duration: 3000 });
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
  async publishSelectedMovies(): Promise<boolean> {
    try {
      const creations = this.selection.selected.filter(importState => importState.movie.id && !hasImportErrors(importState) && this.isTitleValidForPublish(importState));
      for (const movie of creations) {
        this.publishedTitles++;
        await this.publish(movie);
      }
      this.snackBar.open(`${this.publishedTitles} titles published!`, 'close', { duration: 3000 });
      this.publishedTitles = 0;
      return true;
    } catch (err) {
      this.snackBar.open(`Could not published all titles (${this.publishedTitles} / ${this.selection.selected.length})`, 'close', { duration: 3000 });
      this.publishedTitles = 0;
    }
  }

  /**
   * Adds a movie to database and prevents multi-insert by refreshing mat-table
   * @param importState
   */
  private async addMovie(importState: MovieImportState): Promise<boolean> {
    const data = this.rows.data;
    importState.movie = await this.movieService.create(importState.movie);
    importState.errors.push({
      type: 'error',
      field: 'main.internalRef',
      name: 'Film Code',
      reason: 'Movie already exists',
      hint: 'Movie already saved'
    });
    this.rows.data = data;

    if (importState.distributionRights) {
      const orgId = this.orgQuery.getActiveId();
      const movieId = importState.movie.id;
      const titlesAndRights = { [movieId]: importState.distributionRights };

      // Initializes a new 'mandate' contract
      const mandateContract = createContract({ type: 'mandate' });

      // Set movie producing company as licensor
      const licensor = createContractPartyDetail();
      licensor.party.role = 'licensor';
      licensor.party.displayName = `${importState.movie.main.internalRef}'s producer`;

      // Lets try to add more info about licensor with movie producing company
      if (importState.movie.main?.stakeholders?.executiveProducer.length) {
        const firstProducer = importState.movie.main?.stakeholders?.executiveProducer.pop();
        if (firstProducer.orgId) {
          licensor.party.orgId = firstProducer.orgId;
        } else if (firstProducer.displayName) {
          licensor.party.displayName = firstProducer.displayName;
        }
      }
      mandateContract.parties.push(licensor);

      await this.contractService.createContractAndRight(orgId, titlesAndRights, mandateContract);
    }

    return true;
  }

  /**
   * Change title status from 'Draft' to 'Submitted to Archipel Content'
   * @param importState
   */
  private async publish(importState: MovieImportState): Promise<boolean> {
    const data = this.rows.data;
    importState.movie.main.storeConfig.status = getMoviePublishStatus(this.currentApp); // @TODO (#2765)
    await this.movieService.updateById(importState.movie.id, importState.movie);
    this.rows.data = data;
    return true;
  }

  public isTitleValidForPublish(importState: MovieImportState): boolean {
    // Already valid or submitted
    if (
      importState.movie.main.storeConfig.status === 'submitted' ||
      importState.movie.main.storeConfig.status === 'accepted') {
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
      for (const importState of updates) {
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

  isSaveOrUpdateDisabledForTitle(element) {
    return this.errorCount(element) > 0 || this.processedTitles > 0;
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
  public filterPredicate(data: MovieImportState, filter: string) {
    const dataStr = data.movie.main.internalRef + data.movie.main.title.original + data.movie.main.productionYear;
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }

}
