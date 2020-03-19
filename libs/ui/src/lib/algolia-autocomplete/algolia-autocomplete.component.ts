import { searchClient } from '@blockframes/utils/algolia';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
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
  ElementRef
} from '@angular/core';
import { debounceTime, distinctUntilChanged, switchMap, pluck } from 'rxjs/operators';

@Component({
  selector: '[indexName] algolia-autocomplete',
  templateUrl: 'algolia-autocomplete.component.html',
  styleUrls: ['algolia-autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlgoliaAutocompleteComponent implements OnInit {
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
  @Input() pathToValue: string = 'objectID';

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
   * Set your own label if wanted
   */
  @Input() label = 'Search...'

  /**
   * Can set to false if control should display the value
   */
  @Input() resetInput = false;

  /**
   * Different behavior of the mat form field
   */
  @Input() mode: 'legacy' | 'standard' | 'fill' | 'outline' = 'outline'

  /**
   * Determines if we want to have a native control or a mat form field with
   * matInput
   */
  @Input() inputMode: 'matNativeControl' | 'matInput' = 'matInput';

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

  @ViewChild('input') input: ElementRef<HTMLInputElement>

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
   * @param pathToResolve defaults to input variable pathToValue
   */
  private resolveValue(result: any, pathToResolve: string) {
    if (result) {
      return pathToResolve.split('.').reduce((prev, curr) => {
        return prev ? prev[curr] : null
      }, result)
    }
  }

  /**
   * @description this function can be listen on if we want more then
   * just the data from the form control
   * @param event holding all the algolia data available
   */
  public findObjectID(event: MatAutocompleteSelectedEvent) {
    this.control.setValue(this.resolveValue(event.option.value, this.pathToValue));
    this.selectionChange.emit(event.option.value.objectID);
    if (this.resetInput) {
      this.control.reset(null);
    }
    this.displayFn(event.option.value)
  }

  /**
  * Since we input the path we need to initalize the function after the input gets handled,
  * otherwise displayWithPath is undefined and this will throw an error
  */
  public displayFn(value: object) {
    if (typeof value === 'object') {
      const val = this.displayWithPath.split('.').reduce((prev, curr) => {
        return prev ? prev[curr] : null
      }, value)
      console.log(val, this.control.value)
      return val ? val : '';
    }
  }
}
