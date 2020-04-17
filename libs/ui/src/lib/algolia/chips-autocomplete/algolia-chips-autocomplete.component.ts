import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { FormList } from '@blockframes/utils/form';

@Component({
  selector: '[index] [keyToDisplay] [form] algolia-chips-autocomplete',
  templateUrl: './algolia-chips-autocomplete.component.html',
  styleUrls: ['./algolia-chips-autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlgoliaChipsAutocompleteComponent implements OnInit {

  // INPUT ----------------------------

  /**
   * Should be fed with the algolia index name out of the `env.ts`
   * @example [index]="algolia.indexNameMovies" // 'pl_movies' from the env.ts
   */
  @Input() index: string;

  /**
   * The path of the key to display : i.e. What part of the result should be displayed by the input ?
   * @note The value pointed by `keyToDisplay` will also be put in the FormControl of the input field.
   * @note Keep in mind that the result object will be an Algolia record, it can be different form the firestore data model.
   * @note In case of a **facet** search, the `keyToDisplay` is not useful anymore and it's value will be overwritten.
   * @example [keyToDisplay]="title.international"
   */
  @Input() keyToDisplay: string;

  /**
   * The name of the facet to search on.
   * @note .**search is not perform on facets by default** *(enter a value to start searching on facets)*
   */
  @Input() facet = '';

  @Input() form: FormList<string>;

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

  /** Wether or not to display a prefix icon in the input */
  @Input() @boolean icon = false;

  /** The icon to display in the input prefix */
  @Input() prefixIcon: string;

  /** Wether or not to display a cross button to clear the input */
  @Input() @boolean clearable = false;

  ngOnInit() {
    // In case of facet search we know the result object will store the matched facets in the `value` field
    if (!!this.facet.trim()) {
      this.keyToDisplay = 'value';
    }
  }

  add(result: any) {
    const value = this.resolveValue(result, this.keyToDisplay);
    if (!!value) {
      this.form.add(value);
    } else {
      throw new Error(`${this.keyToDisplay} was not found in ${JSON.stringify(result)}`);
    }
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
}
