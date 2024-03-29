import { Component, ChangeDetectionStrategy, Input, OnInit, TemplateRef, ContentChild, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { FormList } from '@blockframes/utils/form';
import { ENTER, COMMA, SEMICOLON, SPACE } from '@angular/cdk/keycodes';
import { UntypedFormControl } from '@angular/forms';
import { AlgoliaIndex, AlgoliaService, maxQueryLength } from '@blockframes/utils/algolia';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, filter, startWith, map } from 'rxjs/operators';
import { getDeepValue } from '@blockframes/utils/pipes/deep-key.pipe';
import { boolean } from '@blockframes/utils/decorators/decorators';

const Separators = {
  [COMMA]: ',',
  [SEMICOLON]: ';',
  [SPACE]: '\\s'
};

function splitValue(value: string, keycodes: number[]) {
  const separators = keycodes.map(code => Separators[code]).filter(v => !!v).join('|');
  const pattern = new RegExp(separators, 'g');
  return value.trim().split(pattern).filter(v => !!v);
}

@Component({
  selector: '[index] [displayWithPath] [form] algolia-chips-autocomplete',
  templateUrl: './algolia-chips-autocomplete.component.html',
  styleUrls: ['./algolia-chips-autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlgoliaChipsAutocompleteComponent implements OnInit, OnDestroy {
  public searchCtrl = new UntypedFormControl();
  /** Holds the results of algolia */
  public algoliaSearchResults$: Observable<unknown[]>;
  public values$: Observable<unknown[]>;
  private sub: Subscription;
  private addedFilters: string[] = [];

  // INPUT ----------------------------

  /**
   * Set index
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

  @Input() form: FormList<unknown>;

  /** Set your own label */
  @Input() label = 'Search...'

  @Input() hint: string;

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

  @Input() @boolean addOnBlur = false;

  /**
   * Set whether it is allowed to add custom values instead of Algolia results only
   */
  @Input() @boolean customInput = false;

  @ViewChild('input') input: ElementRef<HTMLInputElement>;
  @ContentChild(TemplateRef) template: TemplateRef<unknown>;

  constructor(private algoliaService: AlgoliaService) { }

  ngOnInit() {
    this.values$ = this.form.valueChanges.pipe(startWith(this.form.value));
    this.sub = this.form.valueChanges.pipe(
      map(res => !!res.length),
      distinctUntilChanged()
    ).subscribe(isDirty => isDirty ? this.form.markAsDirty() : this.form.markAsPristine());
    // In case of facet search we know the result object will store the matched facets in the `value` field
    if (this.facet?.trim()) {
      this.displayWithPath = 'value';
    }

    const indexSearch = this.algoliaService.getIndex(this.index);

    // create search functions
    const regularSearch = (text: string) => indexSearch.search(text, { facetFilters: this.getFilter() }).then(result => result.hits);
    const facetSearch = (text: string) => indexSearch.searchForFacetValues(this.facet, text).then(result => result.facetHits);

    // perform search
    this.algoliaSearchResults$ = this.searchCtrl.valueChanges.pipe(
      debounceTime(300),
      filter(text => typeof text === 'string' && !!text.trim()),
      map(text => maxQueryLength(text)),
      distinctUntilChanged(),
      switchMap(text => this.facet?.trim() ? facetSearch(text) : regularSearch(text)),
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  /**
   * @param replaceLastValue Set whether the last value in the form has to be replaced. This hides a bug caused by OnBlur adding the typed value when an autocomplete-option is selected.
   */
  add(value: unknown, source: 'autocomplete' | 'input', replaceLastValue = false) {
    if (source === 'input' && !this.customInput) return;
    if (replaceLastValue) this.form.removeAt(this.form.length - 1);

    const values = typeof value === 'string' ? splitValue(value, this.separators) : [value];
    for (const v of values) {
      if (this.unique && !!v && !!v[this.displayWithPath]) this.addedFilters.push(v[this.displayWithPath]);
      delete (v as any)._highlightResult; // removes unwanted algolia attribute
      this.form.add(v);
    }

    this.input.nativeElement.value = '';
    this.searchCtrl.reset();
  }

  edit(index: number) {
    const element = this.form.at(index).value;
    const value = typeof element === 'object'
      ? getDeepValue(element, this.displayWithPath)
      : element;
    this.searchCtrl.setValue(value);
    this.input.nativeElement.value = value;
    this.form.removeAt(index);
  }

  private getFilter() {
    const format = filter => this.unique && !filter.includes(':') ? `${this.displayWithPath}:-${filter}` : filter;
    const allFilters = [...(this.filters || []), ...this.addedFilters]
    return allFilters.map(format);
  }

}
