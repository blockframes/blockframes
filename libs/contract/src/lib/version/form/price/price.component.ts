// Blockframes
import { ContractTunnelComponent } from '@blockframes/contract/contract/tunnel/contract-tunnel.component';
import { ContractVersionForm } from '@blockframes/contract/version/form/version.form';
import { Movie } from '@blockframes/movie/movie/+state/movie.model';
import { FormStaticValue, FormList } from '@blockframes/utils/form';
import { MoviesIndex, MovieAlgoliaResult } from '@blockframes/utils/algolia';

// Angular
import { FormControl } from '@angular/forms';
import { Component, Input, ChangeDetectionStrategy, OnInit, Inject } from '@angular/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

// RxJs & Algolia
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Index } from 'algoliasearch';
import { MovieService } from '@blockframes/movie';

@Component({
  selector: '[form] contract-version-form-price',
  templateUrl: 'price.component.html',
  styleUrls: ['price.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PriceComponent implements OnInit {
  @Input() form: FormList<any, ContractVersionForm>;

  public movieCtrl = new FormControl();

  public currencyCtrl: FormStaticValue<'MOVIE_CURRENCIES'>;

  /* Observable of all movies */
  public movieSearchResults$: Observable<Movie[]>;

  public movies: Movie[] = [];

  public movies$: Observable<Movie[]> = this.tunnel.movies$.pipe(
    distinctUntilChanged((a, b) => a.length === b.length));

  constructor(
    @Inject(MoviesIndex) private movieIndex: Index,
    private movieService: MovieService,
    private tunnel: ContractTunnelComponent) { }

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
  }

  /**
   * @description returns the movie ids which are currently active on the form
   */
  get activeMovieIds(): string[] {
    return Object.keys(this.form.last().get('titles').controls)
  }

  /**
   * @description checks if packgae price is equal or above all the title price
   */
  get totalPrice(): Observable<boolean> {
    let accumilatedPrice = 0;
    const state = new BehaviorSubject(false)
    for (const id of this.activeMovieIds) {
      const version = this.form.last().value;
      accumilatedPrice += version.titles[id].price.amount;
    }
    if (accumilatedPrice > this.totalAmount.value) {
      state.next(true)
    } else {
      state.next(false)
    }
    return state
  }


  /**
   * @description gets the control for the total amount of the package
   */
  get totalAmount() {
    return this.form.last().get('price').get('amount');
  }

  /**
   * @description gets the price form group back for the parameter
   * @param movieId 
   */
  public priceForm(movieId: string) {
    return this.form.last().get('titles').get(movieId).get('price');
  }

  /**
   * @description helper function
   * @param index to remove in array
   * @param movieId movie to remove in the form
   */
  public removeTitle(index: number, movieId: string) {
    this.movies.splice(index, 1)
    this.tunnel.removeTitle(movieId);
  }

  /**
   * @description gets triggered when the user choosed a movie from the dropdown
   * @param event 
   */
  public addMovie(event: MatAutocompleteSelectedEvent) {
    const isMovieAdded = this.movies.filter(movie => movie.id === event.option.value.id);
    if (!isMovieAdded.length) {
      this.tunnel.addTitle(event.option.value.id)
    }
    this.movieCtrl.reset();
  }

  /**
   * @description helper function to transform a algolia search result into a Movie interface
   * @param movies movies to transform
   */
  private async transformAlgoliaMovies(movies: Promise<MovieAlgoliaResult[]>): Promise<Movie[]> {
    const resovledMovies = await movies;
    const movieIds = resovledMovies.map(movie => movie.objectID)
    return this.movieService.getValue(movieIds);
  }
}
