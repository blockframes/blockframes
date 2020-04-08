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

import { Index } from 'algoliasearch';
import { searchClient } from '@blockframes/utils/algolia';

// RxJs
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, filter, tap, map } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';


@Component({
  selector: '[indexName] algolia-autocomplete',
  templateUrl: 'algolia-autocomplete.component.html',
  styleUrls: ['algolia-autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlgoliaAutocompleteComponent implements OnInit, OnDestroy {

  // INPUT ----------------------------

  /**
   * Should be fed with the algolia index name out of the `env.ts`
   * @example [indexName]="algolia.indexNameMovies" // 'pl_movies' from the env.ts
   */
  @Input() indexName: string;

  // OPTIONAL INPUT -------------------

  /**
   * The name of the facet to search on, default value is `''` and means that the search is not perform on facets.
   */
  @Input() facetName = '';

  /**
   * Tells the component which value to pick in the **algolia result object**,
   * i.e. the object stored in the algolia index which can be different form the firestore data model
   * @default 'objectID'
   * @example [pathToValue]="movie.title.original"
   */
  @Input() pathToValue = 'objectID';

  /**
   * If the control should hold a different value then it is displaying it
   * @example movie.main.title.international
   * @default pathToValue variable
   */
  @Input() displayWithPath: string = this.pathToValue;

  /** Optional input if you want to use your own form control */
  @Input() control = new FormControl();

  /** Set your own labe */
  @Input() label = 'Search...'

  /** Set your own placeholder */
  @Input() placeholder = 'Search...'

  /** Can set to false if control should display the value */
  private _resetInput: boolean;
  @Input()
  get resetInput() { return this._resetInput; }
  set resetInput(value: any) {
    this._resetInput = coerceBooleanProperty(value);
  }

  /** Different behavior of the mat form field */
  @Input() mode: 'legacy' | 'standard' | 'fill' | 'outline' = 'outline'

  /** Sets the input to a native input control */
  private _native: boolean;
  @Input()
  get native() { return this._native; }
  set native(value: any) {
    this._native = coerceBooleanProperty(value);
  };

  /** Holds information for showing which icons */
  private _icons: Array<'cross' | 'magnifying_glasses'> = [];
  @Input()
  get icons() { return this._icons }
  set icons(values: Array<'cross' | 'magnifying_glasses'>) {
    this._icons = values
  }

  // OUTPUT ---------------------------

  /** Output to get all data from algolia */
  @Output() selectionChange = new EventEmitter();

  // PRIVATE --------------------------

  private sub: Subscription;

  /** Holds the results of algolia */
  public algoliaSearchResults$: Observable<any>;

  /** The initialized client for algolia */
  private indexSearch: Index;

  /** Holds the last snapshot from algolia results */
  private lastValue$ = new BehaviorSubject(null);

  /** Renders the template coming from the parent component */
  @ContentChild(TemplateRef) template: TemplateRef<any>;

  @ViewChild('input') input: ElementRef<HTMLInputElement>;

  ngOnInit() {

    if (!!this.facetName.trim()) {
      this.pathToValue = 'value'; // for facet the result object only contain a 'value' key
      this.displayWithPath = this.pathToValue;
    }

    // initialize Algolia
    this.indexSearch = searchClient.initIndex(this.indexName);

    this.algoliaSearchResults$ = this.control.valueChanges.pipe(
      debounceTime(300),
      filter(text => typeof text === 'string' && !!text.trim()),
      distinctUntilChanged(),
      switchMap(text => {
        if (!this.facetName.trim()) {
          return this.indexSearch.search(text);
        } else {
          return this.indexSearch.searchForFacetValues({facetName: this.facetName, facetQuery: text});
        }
      }),
      map((result: any) => {
        if (!this.facetName.trim()) {
          return result.hits;
        } else {
          return result.facetHits;
        }
      }),
      tap(data => this.lastValue$.next(data)),
    );
  }

  /**
   * Helper function to dynamically access object value pointed by the `path` param, like the rxjs pluck function
   * @param object usually the result object from Algolia
   * @param path string representing the path to the value, usually `this.pathToValue` or `this.displayWithPath`
   * @example
   * const object = { main: { nested: { name: 'Joe' } } };
   * const path = 'main.nested.name';
   * this.resolve(result); // 'Joe'
   */
  public resolveValue(object: any, path: string) {
    if (object) {
      return path.split('.').reduce((prev, curr) => {
        return prev ? prev[curr] : null
      }, object)
    }
  }

  public selected(event: MatAutocompleteSelectedEvent) {
    const result = this.resolveValue(event.option.value, this.pathToValue);
    this.selectionChange.emit(result);
    if (this.resetInput) {
      this.control.reset();
    }
  }

  /**
  * Since we input the path we need to initialize the function after the input gets handled,
  * otherwise displayWithPath is undefined and this will throw an error
  */
  public displayFn = () => {
    if (this.resetInput) {
      return ''
    }
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
