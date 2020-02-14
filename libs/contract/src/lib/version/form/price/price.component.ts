// Blockframes
import { ContractTunnelComponent } from '@blockframes/contract/contract/tunnel/contract-tunnel.component';
import { ContractVersionForm } from '@blockframes/contract/version/form/version.form';
import { Movie } from '@blockframes/movie/movie/+state/movie.model';
import { FormStaticValue, FormList } from '@blockframes/utils/form';
import { MovieService } from '@blockframes/movie/movie/+state/movie.service';
import { MoviesIndex, MovieAlgoliaResult } from '@blockframes/utils/algolia';

// Angular
import { FormControl } from '@angular/forms';
import { Component, Input, ChangeDetectionStrategy, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

// RxJs & Algolia
import { Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, startWith, tap } from 'rxjs/operators';
import { Index } from 'algoliasearch';

@Component({
  selector: '[form] contract-version-form-price',
  templateUrl: 'price.component.html',
  styleUrls: ['price.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PriceComponent implements OnInit, OnDestroy {
  @Input() form: FormList<any, ContractVersionForm>;

  public movieCtrl = new FormControl();

  public currencyCtrl: FormStaticValue<'MOVIE_CURRENCIES'>;

  /* Observable of all movies */
  public movieSearchResults$: Observable<Movie[]>;

  public movies: Movie[] = [];

  private currencySub: Subscription;

  private movieSub: Subscription;

  constructor(
    @Inject(MoviesIndex) private movieIndex: Index,
    private movieService: MovieService,
    private tunnelComponent: ContractTunnelComponent) { }

  ngOnInit() {
    this.currencyCtrl = this.form.last().get('price').get('currency');
    this.movieSearchResults$ = this.movieCtrl.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(searchText => {
        const results = new Promise<MovieAlgoliaResult[]>((res, rej) => {
          this.movieIndex.search(searchText, (err, result) =>
            err ? rej(err) : res(result.hits)
          );
        });
        return this.transformAlgoliaMovies(results)
      })
    )
    this.movieSub = this.form.valueChanges.pipe(
      startWith(this.form.value),
      distinctUntilChanged((a, b) => a.length === b.length),
      tap(() => this.transformFormToMovie())
    ).subscribe();
  }

  /**
   * @description returns the movie ids which are currently active on the form
   */
  get activeMovieIds(): string[] {
    return Object.keys(this.form.last().get('titles').controls)
  }

  get totalPrice(): boolean {
    let accumilatedPrice: number;
    for (const id of this.activeMovieIds) {
      accumilatedPrice += this.form.last().get('titles').get(id).get('price').get('amount').value
    }
    return accumilatedPrice < this.totalAmount.value
  }


  /**
   * @description gets the control for the total amount of the package
   */
  get totalAmount() {
    return this.form.last().get('price').get('amount');
  }

  /**
   * @description gets the control for the corresponding movie id
   * @param movieId
   */
  public titleIdPrice(movieId: string) {
    return this.form.last().get('titles').get(movieId).get('price').get('amount');
  }

  /**
   * @description helper function
   * @param index to remove in array
   * @param movieId movie to remove in the form
   */
  public removeTitle(index: number, movieId: string) {
    this.movies.splice(index, 1)
    this.tunnelComponent.removeTitle(movieId);
  }

  /**
   * @description gets triggered when the user choosed a movie from the dropdown
   * @param event 
   */
  public addMovie(event: MatAutocompleteSelectedEvent) {
    const isMovieAdded = this.movies.filter(movie => movie.id === event.option.value.id);
    if (!isMovieAdded.length) {
      this.tunnelComponent.addTitle(event.option.value.id)
    }
    this.movieCtrl.reset();
  }

  /**
   * @description helper function to transform a algolia search result into a Movie interface
   * @param movies movies to transform
   */
  private async transformAlgoliaMovies(movies: Promise<MovieAlgoliaResult[]>): Promise<Movie[]> {
    let movieIds: string[];
    await movies.then(resMovies => movieIds = resMovies.map(movie => movie.objectID));
    let moviesFromDB: Movie[];
    await this.movieService.getValue(movieIds).then(moviesDB => moviesFromDB = moviesDB)
    return moviesFromDB;
  }

  /**
   * @description gets the value from DB if there are set previously 
   */
  private async transformFormToMovie() {
    const movies = await this.movieService.getValue(this.activeMovieIds);
    this.movies = movies;
  }

  ngOnDestroy() {
    this.currencySub.unsubscribe();
    this.movieSub.unsubscribe();
  }
}
