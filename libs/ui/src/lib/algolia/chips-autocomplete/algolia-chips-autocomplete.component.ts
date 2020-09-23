import { Component, ChangeDetectionStrategy, Input, OnInit, TemplateRef, ContentChild, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { FormList } from '@blockframes/utils/form';
import { ENTER, COMMA, SEMICOLON, SPACE } from '@angular/cdk/keycodes';
import { FormControl } from '@angular/forms';
import { searchClient, algoliaIndex, AlgoliaIndex } from '@blockframes/utils/algolia';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, filter, startWith, map } from 'rxjs/operators';
import { valueByPath } from '@blockframes/utils/pipes';
import { boolean } from '@blockframes/utils/decorators/decorators';

const Separators = {
  [COMMA]: ',',
  [SEMICOLON]: ';',
  [SPACE]: ' +'
};

function splitValue(value: string, keycodes: number[]) {
  const separators = keycodes.map(code => Separators[code]).filter(v => !!v).join('|');
  const pattern = new RegExp(`\s*(?:${separators})\s*`);
  return value.trim().split(pattern).filter(v => !!v);
}

@Component({
  selector: '[index] [displayWithPath] [form] algolia-chips-autocomplete',
  templateUrl: './algolia-chips-autocomplete.component.html',
  styleUrls: ['./algolia-chips-autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlgoliaChipsAutocompleteComponent implements OnInit, OnDestroy {
  public indexName: string;
  public searchCtrl = new FormControl();
  /** Holds the results of algolia */
  public algoliaSearchResults$: Observable<any[]>;
  public values$: Observable<any[]>;
  private sub: Subscription;

  // INPUT ----------------------------

  /**
   * Should be fed with the algolia index name out of the `env.ts`
   * @example [index]="algolia.indexNameMovies" // 'pl_movies' from the env.ts
   */
  @Input() index: AlgoliaIndex;

  /**
   * The path of the key to display : i.e. What part of the result should be displayed by the input ?
   * @note The value pointed by `displayWithPath` will also be put in the FormControl of the input field.
   * @note Keep in mind that the result object will be an Algolia record, it can be different form the firestore data model.
   * @note In case of a **facet** search, the `displayWithPath` is not useful anymore and it's value will be overwritten.
   * @example displayWithPath="title.international"
   */
  @Input() displayWithPath: string;

  /**
   * The name of the facet to search on.
   * @note .**search is not perform on facets by default** *(enter a value to start searching on facets)*
   */
  @Input() facet: string;

  @Input() form: FormList<any>;

  /** Set your own labe */
  @Input() label = 'Search...'

  /** Set your own placeholder */
  @Input() placeholder = 'Search...'

  /** Different behavior of the mat form field */
  @Input() mode: 'legacy' | 'standard' | 'fill' | 'outline' = 'outline'

  /** The icon to display in the input prefix */
  @Input() prefixIcon: string;

  @Input() separators = [ENTER, COMMA, SEMICOLON];

  @Input() filters: string[];

  /**  
   * Name of attribute which values shouldn't be used before.
   * Using an attribute that hasnt been used before? make sure to add it to Facets on Algolia */
  @Input() @boolean unique;

  @ViewChild('input') input: ElementRef<HTMLInputElement>;
  @ContentChild(TemplateRef) template: TemplateRef<any>;

  constructor() {}

  ngOnInit() {
    this.values$ = this.form.valueChanges.pipe(startWith(this.form.value));
    this.sub = this.form.valueChanges.pipe(
      map(res => !!res.length),
      distinctUntilChanged()
    ).subscribe(isDirty => isDirty ? this.form.markAsDirty() : this.form.markAsPristine());
    // In case of facet search we know the result object will store the matched facets in the `value` field
    if (!!this.facet?.trim()) {
      this.displayWithPath = 'value';
    }
    // initialize Algolia
    const indexSearch = searchClient.initIndex(algoliaIndex[this.index]);

    // create search functions
    const regularSearch = (text: string) => indexSearch.search({query: text, facetFilters: this.getFilter()}).then(result => result.hits);
    const facetSearch = (text: string) => indexSearch.searchForFacetValues({facetName: this.facet, facetQuery: text}).then(result => result.facetHits);

    // perform search
    this.algoliaSearchResults$ = this.searchCtrl.valueChanges.pipe(
      debounceTime(300),
      filter(text => typeof text === 'string' && !!text.trim()),
      distinctUntilChanged(),
      switchMap(text => (!!this.facet?.trim()) ? facetSearch(text) : regularSearch(text)),
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  add(value: any) {
    if (!!value) {
      if (typeof value === 'string') {
        splitValue(value, this.separators).forEach(v => {
          if (this.unique) {
          this.getFilter().push(`${this.displayWithPath}:-${v}`);
          };
          this.form.add(v);
        })
      } else {
        if (this.unique && !!value[this.displayWithPath]) {
          this.getFilter().push(`${this.displayWithPath}:-${value[this.displayWithPath]}`);
        };
        this.form.add(value);
      }
      this.input.nativeElement.value = '';
      this.searchCtrl.setValue(null);
    }
  }

  edit(index: number) {
    const element = this.form.at(index).value;
    const value = typeof element === 'object'
      ? valueByPath(element, this.displayWithPath)
      : element;
    this.searchCtrl.setValue(value);
    this.input.nativeElement.value = value;
    this.form.removeAt(index);
  }

  private getFilter() {
    const format = filter => this.unique && !filter.includes(':') ? `${this.displayWithPath}:-${filter}` : filter;
    return this.filters?.map(format) || [];
  }

}
