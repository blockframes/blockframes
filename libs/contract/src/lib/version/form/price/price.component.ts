import { ContractVersionForm } from '@blockframes/contract/version/form/version.form';
import { Subscription } from 'rxjs';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { Movie } from '@blockframes/movie/movie/+state/movie.model';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { Index } from 'algoliasearch';
import { MoviesIndex, MovieAlgoliaResult } from '@blockframes/utils/algolia';
import { Observable } from 'rxjs';
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

  constructor(@Inject(MoviesIndex) private movieIndex: Index, private movieService: MovieService) { }

  ngOnInit() {
    this.currencyCtrl = this.form.at(0).get('price').get('currency');
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
      map(currency => this.renderCurrencySymbol(currency))).subscribe()
  }
  // TODO(MF) add this.tunnelComponent.addTitle
  public addMovie(event: MatAutocompleteSelectedEvent) {
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

  public titleIdPrice(movieId: string) {
    console.log(this.form.at(0));
    return this.form.at(0).get('titles')
  }

  public removeTitle(movieId: string) {

  }

  private async transformMovie(movies: Promise<MovieAlgoliaResult[]>): Promise<Movie[]> {
    let movieIds: string[];
    await movies.then(resMovies => movieIds = resMovies.map(movie => movie.objectID));
    let moviesFromDB: Movie[];
    await this.movieService.getValue(movieIds).then(moviesDB => moviesFromDB = moviesDB)
    return moviesFromDB;
  }
}
