import { Component, ChangeDetectionStrategy, Input, OnInit, TemplateRef, ContentChild, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { FormList } from '@blockframes/utils/form';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { FormControl } from '@angular/forms';
import { searchClient, algoliaIndex, AlgoliaIndex, GetAlgoliaSchema } from '@blockframes/utils/algolia';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, filter } from 'rxjs/operators';

@Component({
  selector: '[index] [displayWithPath] [form] algolia-chips-autocomplete',
  templateUrl: './algolia-chips-autocomplete.component.html',
  styleUrls: ['./algolia-chips-autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlgoliaChipsAutocompleteComponent implements OnInit {
  public indexName: string;
  public separatorKeysCodes: number[] = [ENTER, COMMA];
  public searchCtrl = new FormControl();
  /** Holds the results of algolia */
  public algoliaSearchResults$: Observable<any[]>;

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

  @ViewChild('input') input: ElementRef<HTMLInputElement>;
  @ContentChild(TemplateRef) template: TemplateRef<any>;

  constructor() {}

  ngOnInit() {
    // In case of facet search we know the result object will store the matched facets in the `value` field
    if (!!this.facet?.trim()) {
      this.displayWithPath = 'value';
    }
    // initialize Algolia
    const indexSearch = searchClient.initIndex(algoliaIndex[this.index]);

    // create search functions
    const regularSearch = (text: string) => indexSearch.search(text).then(result => result.hits);
    const facetSearch = (text: string) => indexSearch.searchForFacetValues({facetName: this.facet, facetQuery: text}).then(result => result.facetHits);

    // perform search
    this.algoliaSearchResults$ = this.searchCtrl.valueChanges.pipe(
      debounceTime(300),
      filter(text => typeof text === 'string' && !!text.trim()),
      distinctUntilChanged(),
      switchMap(text => (!!this.facet?.trim()) ? facetSearch(text) : regularSearch(text)),
    );
  }

  add(value: any) {
    this.form.add(value);
    this.input.nativeElement.value = '';
    this.searchCtrl.setValue(null);
  }
}
