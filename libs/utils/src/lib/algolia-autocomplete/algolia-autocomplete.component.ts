import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { searchClient } from './../algolia';
import { FormControl } from '@angular/forms';
import {
  Component,
  Input,
  ChangeDetectionStrategy,
  OnInit,
  Output,
  EventEmitter,
  ContentChild,
  TemplateRef
} from '@angular/core';
import { debounceTime, distinctUntilChanged, switchMap, pluck } from 'rxjs/operators';

@Component({
  selector: '[indexName][pathToValue] algolia-autocomplete',
  templateUrl: 'algolia-autocomplete.component.html',
  styleUrls: ['algolia-autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlgoliaAutocompleteComponent implements OnInit {
  /**
   * Should be fed with the algolia object
   * out of the env.ts
   */
  @Input() set indexName(name: string) {
    this.config.indexName = name;
  }

  /**
   * Tells the component which value to pick for the control
   */
  @Input() pathToValue: string;

  /**
  * Optional input if you want to use your own form control
  */
  @Input() control = new FormControl();

  /**
   * Set your own label if wanted
   */
  @Input() label = 'Search...'

  /**
   * Can set to false if control should display the value
   */
  @Input() resetInput = true;

  /**
   * Output to get all data from algolia
   */
  @Output() emitSelect = new EventEmitter();

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

  ngOnInit() {
    this.indexSearch = this.config.searchClient.initIndex(this.config.indexName)
    this.algoliaSearchResults$ = this.control.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(text => this.indexSearch.search(text)),
      pluck('hits')
    );
  }

  /**
   * @description helper function to dynamically access object value
   * @param result object from algolia
   */
  public resolveValue(result: any) {
    return this.pathToValue.split('.').reduce((prev, curr) => {
      return prev ? prev[curr] : null
    }, result || self)
  }

  /**
   * @description this function can be listen on if we want more then
   * just the data from the form control
   * @param event holding all the algolia data available
   */
  public findObjectID(event: MatAutocompleteSelectedEvent) {
    this.control.setValue(this.resolveValue(event.option.value));
    this.emitSelect.emit(event.option.value.objectID);
    if (this.resetInput) {
      this.control.reset(null);
    }
  }
}
