// Angular
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

// Blockframes
import {  AlgoliaIndex } from '@blockframes/utils/algolia/algolia.interfaces';
import { AlgoliaService } from '@blockframes/utils/algolia/algolia.service';
import { getDeepValue } from '@blockframes/utils/pipes/deep-key.pipe';

// RxJs
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, filter, tap } from 'rxjs/operators';
import { boolean } from '@blockframes/utils/decorators/decorators';

@Component({
  selector: '[index] [keyToDisplay] algolia-autocomplete',
  templateUrl: 'algolia-autocomplete.component.html',
  styleUrls: ['algolia-autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlgoliaAutocompleteComponent implements OnInit, OnDestroy {

  // INPUT ----------------------------

  /**
   * Set index
   */
  @Input() index: AlgoliaIndex;

  /**
   * The path of the key to display : i.e. What part of the result should be displayed by the input ?
   * @note The value pointed by `keyToDisplay` will also be put in the FormControl of the input field.
   * @note Keep in mind that the result object will be an Algolia record, it can be different form the firestore data model.
   * @note In case of a **facet** search, the `keyToDisplay` is not useful anymore and it's value will be overwritten.
   * @example [keyToDisplay]="title.international"
   */
  @Input() keyToDisplay: string;

  // OPTIONAL INPUT -------------------

  /**
   * The name of the facet to search on.
   * @note .**search is not perform on facets by default** *(enter a value to start searching on facets)*
   * @example facet="orgName"
   */
  @Input() facet = '';

  /** Optional input if you want to use your own form control */
  @Input() control = new FormControl();

  /** Set your own labe */
  @Input() label = 'Search...'

  /** Set your own placeholder */
  @Input() placeholder = 'Search...'

  /** Can set to false if control should display the value */
  @Input() @boolean resetInput = false;

  /** Different behavior of the mat form field */
  @Input() mode: 'legacy' | 'standard' | 'fill' | 'outline' = 'outline'

  /** Wether to use a material input or a native html input */
  @Input() @boolean native = false;

  /** The icon to display in the input prefix */
  @Input() prefixIcon: string;

  /** Wether or not to display a cross button to clear the input */
  @Input() @boolean clearable = false;

  // OUTPUT ---------------------------

  /** Output emitted on every select, it return the whole record object */
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

  constructor(private algoliaService: AlgoliaService) { }

  ngOnInit() {
    // In case of facet search we know the result object will store the matched facets in the `value` field
    if (!!this.facet.trim()) {
      this.keyToDisplay = 'value';
    }
    if (this.index === 'user') {
      this.indexSearch = this.algoliaService.userIndex;
    } else if (this.index === 'org') {
      this.indexSearch = this.algoliaService.orgIndex
    } else {
      this.indexSearch = this.algoliaService.movieIndex;
    }

    // create search functions
    const regularSearch = (text: string) => this.indexSearch.search(text).then(result => result.hits);
    const facetSearch = (text: string) => this.indexSearch.searchForFacetValues({ facetName: this.facet, facetQuery: text }).then(result => result.facetHits);

    // perform search
    this.algoliaSearchResults$ = this.control.valueChanges.pipe(
      debounceTime(300),
      filter(text => typeof text === 'string' && !!text.trim()),
      distinctUntilChanged(),
      switchMap(text => (!!this.facet.trim()) ? facetSearch(text) : regularSearch(text)),
      tap(data => this.lastValue$.next(data)),
    );
  }


  public selected(result: any) {
    this.selectionChange.emit(result);
    if (this.resetInput) {
      this.control.reset();
    }
  }

  /**
   * This function is used internally by the MatAutocomplete to decide
   * what to display in the input field when an option has been selected
   */
  public displayFn() {
    if (this.resetInput) {
      return ''
    }
    const value = this.lastValue$.getValue();
    if (value) {
      return getDeepValue(value[0], this.keyToDisplay);
    }
    return this.control.value;
  }

  ngOnDestroy() {
    if (this.sub) { this.sub.unsubscribe() }
  }
}
