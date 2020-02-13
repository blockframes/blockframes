import { ContractTunnelComponent } from '@blockframes/contract/contract/tunnel/contract-tunnel.component';
import { ContractVersionForm } from '@blockframes/contract/version/form/version.form';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { Movie } from '@blockframes/movie/movie/+state/movie.model';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { Index } from 'algoliasearch';
import { MoviesIndex, MovieAlgoliaResult } from '@blockframes/utils/algolia';
import { Observable, Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { Component, Input, ChangeDetectionStrategy, OnInit, Inject } from '@angular/core';
import { MovieService } from '@blockframes/movie';
import { FormStaticValue, FormList } from '@blockframes/utils/form';

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

  private currencySub: Subscription;

  public currencyIcon = '';

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
        return this.transformMovie(results)
      })
    )
    this.currencySub = this.currencyCtrl.valueChanges.pipe(
      map(currency => this.renderCurrencySymbol(currency))).subscribe();
  }

  /**
   * @description gets triggered when the user choosed a movie from the dropdown
   * @param event 
   */
  public addMovie(event: MatAutocompleteSelectedEvent) {
    this.tunnelComponent.addTitle(event.option.value.id)
    this.movieCtrl.reset();
    this.movies.push(event.option.value)
  }

  private renderCurrencySymbol(currency: string) {
    switch (currency) {
      case 'us-dollar':
        this.currencyIcon = 'dollar';
        break;
      case 'euro':
        this.currencyIcon = 'euro';
        break;
      case 'japanese-yen':
        this.currencyIcon = 'cny';
        break;
      case 'pund-sterling':
        this.currencyIcon = 'gbp';
        break;
      case 'australian-dollar':
        this.currencyIcon = 'aud';
        break;
      case 'canadian-dollar':
        this.currencyIcon = 'cad';
        break;
      case 'swiss-franc':
        this.currencyIcon = 'chf';
        break;
      case 'chinese-renminbi':
        this.currencyIcon = 'cny';
        break;
      case 'swedish-krona':
        this.currencyIcon = 'sek';
        break;
      case 'new-zeeland-dollar':
        this.currencyIcon = 'nzd';
        break;
    }
  }

  /**
   * @description gets the control for the total amount of the package
   */
  get totalAmount() {
    return this.form.last().get('price').get('amount');
  }

/**
 * @description gets the control for the corresponding movie id
 * @param movieId movie id fo
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
   * @description helper function to transform a algolia search result into a Movie interface
   * @param movies movies to transform
   */
  private async transformMovie(movies: Promise<MovieAlgoliaResult[]>): Promise<Movie[]> {
    let movieIds: string[];
    await movies.then(resMovies => movieIds = resMovies.map(movie => movie.objectID));
    let moviesFromDB: Movie[];
    await this.movieService.getValue(movieIds).then(moviesDB => moviesFromDB = moviesDB)
    return moviesFromDB;
  }
}
