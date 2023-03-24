// Angular
import { UntypedFormControl } from '@angular/forms';
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
  OnDestroy,
  Directive
} from '@angular/core';
import { SearchIndex } from 'algoliasearch';

// Blockframes
import { AlgoliaService, AlgoliaIndex, maxQueryLength } from '@blockframes/utils/algolia';

// RxJs
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, filter, tap, map } from 'rxjs/operators';
import { boolean } from '@blockframes/utils/decorators/decorators';

@Directive({ selector: '[optionRef]' })
export class OptionRefDirective { }

@Directive({ selector: '[lastOptionRef]' })
export class LastOptionRefDirective { }

@Component({
  selector: '[keyToDisplay] algolia-autocomplete',
  templateUrl: 'algolia-autocomplete.component.html',
  styleUrls: ['algolia-autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlgoliaAutocompleteComponent implements OnInit, OnDestroy {

  // INPUT ----------------------------

  /**
   * Set index
   */
  @Input() index: AlgoliaIndex = 'org';

  @Input() indexGroup: string;

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
  @Input() control = new UntypedFormControl();

  /** Set if it's required */
  @Input() required = false;

  /** Set your own placeholder */
  @Input() placeholder = 'Search...'

  /** Can set to false if control should display the value */
  @Input() @boolean resetInput = false;

  /** Different behavior of the mat form field */
  @Input() mode: 'legacy' | 'standard' | 'fill' | 'outline' = 'outline'


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
  public algoliaSearchResults$: Observable<unknown>;

  /** The initialized client for algolia */
  private indexSearch: SearchIndex;

  /** Holds the last snapshot from algolia results */
  private lastValue$ = new BehaviorSubject(null);

  /** Renders the templates coming from the parent component */
  @ContentChild(OptionRefDirective, { read: TemplateRef }) optionRef: OptionRefDirective;
  @ContentChild(LastOptionRefDirective, { read: TemplateRef }) lastOptionRef: LastOptionRefDirective;

  @ViewChild('input') input: ElementRef<HTMLInputElement>;

  constructor(private algoliaService: AlgoliaService) { }

  ngOnInit() {
    // In case of facet search we know the result object will store the matched facets in the `value` field
    if (this.facet.trim()) {
      this.keyToDisplay = 'value';
    }

    this.indexSearch = this.algoliaService.getIndex(this.index);

    // create search functions
    const multipleSearch = (text: string) => this.algoliaService.multipleQuery(this.indexGroup, text);
    const regularSearch = (text: string) => this.indexSearch.search(text).then(result => result.hits);
    const facetSearch = (text: string) => this.indexSearch.searchForFacetValues(this.facet, text).then(result => result.facetHits);

    // perform search
    this.algoliaSearchResults$ = this.control.valueChanges.pipe(
      debounceTime(300),
      filter(text => typeof text === 'string' && !!text.trim()),
      map(text => maxQueryLength(text)),
      distinctUntilChanged(),
      switchMap(async text => {
        if (this.indexGroup) {
          return multipleSearch(text);
        } else {
          return this.facet.trim() ? facetSearch(text) : regularSearch(text);
        }
      }),
      tap(data => this.lastValue$.next(data)),
    );
  }

  public selected(result: unknown) {
    this.selectionChange.emit(result);
    if (this.resetInput) {
      this.control.reset();
    }
  }

  ngOnDestroy() {
    if (this.sub) { this.sub.unsubscribe() }
  }


}
