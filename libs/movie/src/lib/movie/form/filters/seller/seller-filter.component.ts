import { Component, ChangeDetectionStrategy, Input, OnInit, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { FormList } from '@blockframes/utils/form';
import { debounceTime, distinctUntilChanged, filter, switchMap, pluck, map } from 'rxjs/operators';
import { MoviesIndex } from '@blockframes/utils/algolia';
import { Index } from 'algoliasearch';
import { FormControl } from '@angular/forms';

@Component({
  selector: '[form] title-filter-seller',
  templateUrl: './seller-filter.component.html',
  styleUrls: ['./seller-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SellerFilterComponent implements OnInit {

  @Input() form: FormList<string>;

  public orgSearch = new FormControl('');
  public orgSearchResults$: Observable<any>;

  constructor(
    @Inject(MoviesIndex) private movieIndex: Index,
  ) {}

  ngOnInit() {
    /** fill the seller autocomplete with orgs queried from algolia */
    this.orgSearchResults$ = this.orgSearch.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      filter((text: string) => !!text.trim()),
      switchMap(text => this.movieIndex.searchForFacetValues({facetName: 'orgName', facetQuery: text})),
      pluck('facetHits'),
      map(results => results.map(result => result.value)),
    );
  }
}
