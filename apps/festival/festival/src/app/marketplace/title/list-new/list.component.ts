import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Subscription, Observable } from 'rxjs';

import { MovieService, MovieQuery } from '@blockframes/movie/+state';
import { FormControl } from '@angular/forms';
import { CatalogSearchForm, AvailsSearchForm } from '@blockframes/distribution-deals/form/search.form';

@Component({
  selector: 'festival-marketplace-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {

  private sub: Subscription;
  public movieSearchResults$: Observable<any>;

  public sortByControl: FormControl = new FormControl('Title');
  public sortOptions: string[] = ['All films', 'Title', 'Director' /* 'Production Year' #1146 */];

  public filterForm = new CatalogSearchForm();
  public searchbarTextControl: FormControl = new FormControl('');

  public availsForm = new AvailsSearchForm();

  constructor(
    private movieQuery: MovieQuery,
    private movieService: MovieService,
  ) {}

  ngOnInit() {
    this.sub = this.movieService.syncCollection(ref => ref.limit(30)).subscribe();

    this.movieSearchResults$ = this.movieQuery.selectAll({limitTo: 10});
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
