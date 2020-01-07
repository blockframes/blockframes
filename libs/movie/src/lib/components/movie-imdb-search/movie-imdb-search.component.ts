import { Component, OnInit, ChangeDetectionStrategy, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { omdbApiKey } from "@env";
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ImdbService, SearchRequest, SearchResult, ImdbMovie, SearchResults, yearValidators } from '@blockframes/utils';
import { MatPaginator, MatTableDataSource, MatRadioChange } from '@angular/material';

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
  public searchType = 'exact';

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
      searchvalue: [this.data.name, Validators.required],
      year: new FormControl(this.data.year, yearValidators),
      searchtype: new FormControl(this.searchType, Validators.required),
    });

    this.rows.paginator = this.paginator;
  }

  public async imdbSearch() {
    if (!this.searchForm.valid) {
      this.snackBar.open('Invalid form', 'close', { duration: 1000 });
      return
    }

    this.formSubmitted = true;
    const { searchvalue, year, searchtype } = this.searchForm.value;

    try {
      let promise : Promise<ImdbMovie | SearchResults>;
      switch (searchtype) {
        case 'exact':
          promise = this.imdbService.get({ name: searchvalue, year })
          break;
        case 'id':
          promise = this.imdbService.get({ id: searchvalue, year })
          break;
        default:
          promise = this.imdbService.search({ name: searchvalue, year })
          break;
      }
      const search: ImdbMovie | SearchResults = await promise;
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
    if (result instanceof ImdbMovie) {
      this.dialogRef.close(result);
    } else {
      const movie: ImdbMovie = await this.imdbService.get({ id: result.imdbid });
      this.dialogRef.close(movie);
    }
  }

  public async changePage($event) {
    try {
      const search: ImdbMovie | SearchResults = await this.imdbService.search(this.data, $event.pageIndex + 1);
      this.rows.data = [...search.results];
    } catch (e) {
      this.snackBar.open(`An error occured : ${e.message}`, 'close', { duration: 1000 });
    }
  }

  public searchTypeChange($event: MatRadioChange) {
    this.searchType = $event.value;
  }
}
