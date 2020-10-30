// Blockframes
import { algolia } from '@env';
import { ContractTunnelComponent } from '@blockframes/contract/contract/tunnel/contract-tunnel.component';
import { ContractVersionForm } from '@blockframes/contract/version/form/version.form';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { FormStaticValue } from '@blockframes/utils/form';

// Angular
import { Component, Input, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';

// RxJs & Algolia & etc
import { Observable, BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

@Component({
  selector: '[form] contract-version-form-price',
  templateUrl: 'price.component.html',
  styleUrls: ['price.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PriceComponent implements OnInit {
  @Input() form: ContractVersionForm;
  public _hasMandate: boolean;
  @Input()
  get hasMandate() { return this._hasMandate; }
  set hasMandate(value: boolean) {
    this._hasMandate = coerceBooleanProperty(value);
  }

  public algoliaMovieIndex = algolia.indexNameMovies.catalog;

  public currencyCtrl: FormStaticValue<'movieCurrencies'>;

  /* Observable of all movies */
  public movieSearchResults$: Observable<Movie[]>;

  public movies$: Observable<Movie[]>;

  constructor(private tunnel: ContractTunnelComponent) { }

  ngOnInit() {
    this.movies$ = this.tunnel.movies$.pipe(
      distinctUntilChanged((a, b) => a.length === b.length));
    this.currencyCtrl = this.form.get('price').get('currency');
  }

  /**
   * @description returns the movie ids which are currently active on the form
   */
  get activeMovieIds(): string[] {
    return Object.keys(this.form.get('titles').controls)
  }

  /**
   * @description checks if package price is equal or above all the title price
   */
  get totalPrice$(): Observable<boolean> {
    let accumulatedPrice = 0;
    const state = new BehaviorSubject(false)
    for (const id of this.activeMovieIds) {
      const version = this.form.value;
      accumulatedPrice += version.titles[id].price.amount;
    }
    accumulatedPrice > this.totalAmount.value ? state.next(true) : state.next(false)
    return state
  }

  /**
   * @description gets the control for the total amount of the package
   */
  get totalAmount() {
    return this.form.get('price').get('amount');
  }

  /**
   * @description gets the price form group back for the parameter
   * @param movieId
   */
  public priceForm(movieId: string) {
    return this.form.get('titles').get(movieId).get('price');
  }

  public selectMovie(movieId: string) {
    return this.movies$.pipe(map(movies => movies.find(movie => movie.id === movieId)))
  }

  /**
   * @description gets the control for the commision amount of the package
   */
  get commissionFee() {
    return this.form.get('price').get('commission');
  }

  /**
   * @description helper function
   * @param movieId movie to remove in the form
   */
  public removeTitle(movieId: string) {
    this.tunnel.removeTitle(movieId);
  }

  /**
   * @description gets triggered when the user chose a movie from the dropdown
   * @param event
   */
  public addMovie(result: any) {
    this.tunnel.addTitle(result.objectID, this._hasMandate);
  }
}
