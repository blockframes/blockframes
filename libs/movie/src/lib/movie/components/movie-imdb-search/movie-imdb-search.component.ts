import { Component, OnInit, ChangeDetectionStrategy, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { omdbApiKey } from "@env";
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ImdbService, SearchRequest, SearchResult, ImdbMovie, SearchResults, yearValidators } from '@blockframes/utils';
import { MatPaginator, MatTableDataSource } from '@angular/material';

@Component({
  selector: 'movie-imdb-search',
  templateUrl: './movie-imdb-search.component.html',
  styleUrls: ['./movie-imdb-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieImdbSearchComponent implements OnInit {
  public searchForm: FormGroup;

  public displayedColumns: string[] = [
    'imdbid',
    'poster',
    'title',
    'year',
    'actions',
  ];
  public rows = new MatTableDataSource<ImdbMovie | SearchResult>([]);
  public formSubmitted = false;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
    private dialogRef: MatDialogRef<MovieImdbSearchComponent>,
    private snackBar: MatSnackBar,
    private builder: FormBuilder,
    private imdbService: ImdbService,
    @Inject(MAT_DIALOG_DATA) public data: SearchRequest
  ) {
    this.imdbService.setApiKey(omdbApiKey);
  }

  ngOnInit() {
    this.searchForm = this.builder.group({
      name: [this.data.name, Validators.required],
      year: new FormControl(this.data.year, yearValidators),
      exact: [true],
    });

    this.rows.paginator = this.paginator;
  }

  public async imdbSearch() {
    if (!this.searchForm.valid) {
      this.snackBar.open('Invalid form', 'close', { duration: 1000 });
      return
    }

    this.formSubmitted = true;
    const { name, year, exact } = this.searchForm.value;
    const method = exact ? 'get' : 'search';

    try {
      const search: ImdbMovie | SearchResults = await this.imdbService[method]({ name, year });
      if (search instanceof ImdbMovie) {
        this.rows.data = [search];
      } else if (search instanceof SearchResults) {
        this.rows.data = [...search.results];
      }
    } catch (e) {
      this.snackBar.open(`An error occured : ${e.message}`, 'close', { duration: 1000 });
    }
  }

  public searchAgain() {
    this.formSubmitted = false;
    this.rows.data = [];
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
      this.rows.data = [...search.results];
    } catch (e) {
      this.snackBar.open(`An error occured : ${e.message}`, 'close', { duration: 1000 });
    }
  }
}
