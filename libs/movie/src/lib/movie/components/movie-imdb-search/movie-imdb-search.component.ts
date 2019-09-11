import { Component, OnInit, ChangeDetectionStrategy, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ImdbService, SearchRequest, SearchResult, ImdbMovie, SearchResults, YearControl } from '@blockframes/utils';
import { MatPaginator, MatTableDataSource } from '@angular/material';

@Component({
  selector: 'movie-imdb-search',
  templateUrl: './movie-imdb-search.component.html',
  styleUrls: ['./movie-imdb-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieImdbSearchComponent implements OnInit {
  public searchForm: FormGroup;
  private apiKey = '4d1be897';

  public displayedColumns: string[] = [
    'imdbid',
    'poster',
    'title',
    'year',
    'actions',
  ];
  public rows = new MatTableDataSource<ImdbMovie | SearchResult>([]);
  public resultsCount = 0;
  public formValid = false;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
    private dialogRef: MatDialogRef<MovieImdbSearchComponent>,
    private snackBar: MatSnackBar,
    private builder: FormBuilder,
    private imdbService: ImdbService,
    @Inject(MAT_DIALOG_DATA) public data: SearchRequest
  ) {
    this.imdbService.setApiKey(this.apiKey);
  }

  ngOnInit() {
    this.searchForm = this.builder.group({
      name: [this.data.name, Validators.required],
      year: new YearControl(this.data.year),
      exact: [true],
    });

    this.rows.paginator = this.paginator;
  }

  public async imdbSearch() {
    if (!this.searchForm.valid) {
      this.snackBar.open('Invalid form', 'close', { duration: 1000 });
      return
    }

    this.formValid = true;
    this.data.name = this.searchForm.value.name;
    this.data.year = this.searchForm.value.year

    let method = 'search';
    if (this.searchForm.value.exact) {
      method = 'get';
    }

    try {
      const search: ImdbMovie | SearchResults = await this.imdbService[method](this.data);
      if (search instanceof ImdbMovie) {
        this.rows.data.push(search);
        this.resultsCount = 1;
      } else if (search instanceof SearchResults) {
        search.results.map((result: SearchResult) => this.rows.data.push(result));
        this.resultsCount = search.totalresults;
      }
      this.rows.data = [...this.rows.data];
    } catch (e) {
      this.snackBar.open(`An error occured : ${e.message}`, 'close', { duration: 1000 });
    }
  }

  public searchAgain() {
    this.formValid = false;
    this.rows.data = [];
  }

  public cancel(): void {
    this.dialogRef.close();
  }

  public onNoClick(): void {
    this.dialogRef.close();
  }

  public async importMovie(result: ImdbMovie | SearchResult): Promise<void> {
    // send back the selected result
    if(result instanceof ImdbMovie){
      this.dialogRef.close(result);
    } else {
      const movie : ImdbMovie = await this.imdbService.get({id : result.imdbid});
      this.dialogRef.close(movie);
    }
  }

  public async changePage(event){
    try {
      const search: ImdbMovie | SearchResults = await this.imdbService.search(this.data, event.pageIndex + 1);
      this.rows.data = [];
      search.results.map((result: SearchResult) => this.rows.data.push(result));
      this.resultsCount = search.totalresults;
      this.rows.data = [...this.rows.data];
    } catch (e) {
      this.snackBar.open(`An error occured : ${e.message}`, 'close', { duration: 1000 });
    }
  }
}
