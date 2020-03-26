// Angular
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { FormControl } from '@angular/forms';
import {
  Component,
  Input,
  ChangeDetectionStrategy,
  OnInit,
  Output,
  EventEmitter,
  ContentChild,
  TemplateRef,
  ViewChild,
  ElementRef,
  OnDestroy
} from '@angular/core';

import { searchClient } from '@blockframes/utils/algolia';

// RxJs
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, pluck, filter } from 'rxjs/operators';

@Component({
  selector: '[indexName] algolia-autocomplete',
  templateUrl: 'algolia-autocomplete.component.html',
  styleUrls: ['algolia-autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlgoliaAutocompleteComponent implements OnInit, OnDestroy {
  /**
   * Should be fed with the algolia object
   * out of the env.ts
   * @example algolia.indexNameMovies from your env.ts
   */
  @Input() set indexName(name: string) {
    this.config.indexName = name;
  }

  /**
   * Tells the component which value to pick for the control,
   * @default objectID
   * @example movie.main.title.original
   */
  @Input() pathToValue = 'objectID';

  /**
   * If the control should hold a different value then it is displaying it
   * @example movie.main.title.international
   * @default pathToValue variable
   */
  @Input() displayWithPath: string = this.pathToValue;

  /**
  * Optional input if you want to use your own form control
  */
  @Input() control = new FormControl();

  /**
   * Set your own label
   */
  @Input() label = 'Search...'

  /**
   * Set your own placeholder
   */
  @Input() placeholder = 'Search...'

  /**
   * Can set to false if control should display the value
   */
  @Input() resetInput = false;

  /**
   * Different behavior of the mat form field
   */
  @Input() mode: 'legacy' | 'standard' | 'fill' | 'outline' = 'outline'

  private sub: Subscription;

  private _native: boolean;

  /**
   * Sets the input to a native input control
   */
  @Input()
  get native() { return this._native }
  set native(value: any) {
    this._native = coerceBooleanProperty(value);
  };

  /**
   * Holds information for showing which icons
   */
  private _icons: Array<'cross' | 'magnifying_glasses'> = [];

  @Input()
  get icons() { return this._icons }
  set icons(values: Array<'cross' | 'magnifying_glasses'>) {
    this._icons = values
  }

  /**
   * Output to get all data from algolia
   */
  @Output() selectionChange = new EventEmitter();

  /**
   * Renders the template coming from the parten component
   */
  @ContentChild(TemplateRef) template: TemplateRef<any>;

  /**
   * Holds the results of algolia
   */
  public algoliaSearchResults$: Observable<any>;

  /**
   * Config to search upon algolia
   */
  private config = {
    indexName: '',
    searchClient
  }

  /**
   * The initialized client for algolia
   */
  private indexSearch;

  /**
   * Holds the last snapshot from algolia results
   */
  private lastValue$ = new BehaviorSubject(null);

  @ViewChild('input') input: ElementRef<HTMLInputElement>

  ngOnInit() {
    this.indexSearch = this.config.searchClient.initIndex(this.config.indexName)
    this.algoliaSearchResults$ = this.control.valueChanges.pipe(
      debounceTime(300),
      filter(text => typeof text === 'string'),
      distinctUntilChanged(),
      switchMap(text => this.indexSearch.search(text)),
      pluck('hits')
    );
    this.sub = this.algoliaSearchResults$.subscribe(data => this.lastValue$.next(data));
  }

  /**
   * @description helper function to dynamically access object value
   * @param result object from algolia
   * @param pathToResolve defaults to input variable pathToValue
   */
  public resolveValue(result: any, pathToResolve: string) {
    if (result) {
      return pathToResolve.split('.').reduce((prev, curr) => {
        return prev ? prev[curr] : null
      }, result)
    }
  }

  /**
   * @description this function can be listen on if we want more then
   * just the data from the form control
   */
  public findObjectID() {
    const objectID = this.lastValue$.getValue()[0].objectID;
    this.selectionChange.emit(objectID);
    if (this.resetInput) {
      this.control.reset(null);
    }
  }

  /**
  * Since we input the path we need to initalize the function after the input gets handled,
  * otherwise displayWithPath is undefined and this will throw an error
  */
  public displayFn() {
    const value = this.lastValue$.getValue();
    if (value) {
      return this.resolveValue(value[0], this.displayWithPath)
    }
    return this.control.value;
  }

  ngOnDestroy() {
    if (this.sub) { this.sub.unsubscribe() }
  }
}
