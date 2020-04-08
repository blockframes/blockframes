import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Subscription, Observable } from 'rxjs';

import { MovieService, MovieQuery } from '@blockframes/movie/+state';
import { algolia } from '@env';
import { FormControl, FormGroup, FormArray } from '@angular/forms';
import { CatalogSearchForm, AvailsSearchForm } from '@blockframes/distribution-deals/form/search.form';
import { staticModels } from '@blockframes/utils/static-model';

import { FormList } from '@blockframes/utils/form';

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

  // TODO use or create/refactor a single form instead of multiple form like right now

  // country
  public countries = staticModels['TERRITORIES'];

  // TODO use FormList after #2489 has been fixed
  public languageForm = new FormGroup({
    original: new FormArray([]),
    dubbed: new FormArray([]),
    subtitle: new FormArray([]),
    caption: new FormArray([]),
  });

  // status
  public movieProductionStatuses = staticModels['MOVIE_STATUS'];

  public movieIndex = algolia.indexNameMovies;

  // TODO use FormList after #2489 has been fixed
  public sellersForm = new FormArray([]);

  constructor(
    private movieService: MovieService,
    private movieQuery: MovieQuery,
  ) { }

  ngOnInit() {
    this.sub = this.movieService.syncCollection(ref => ref.limit(30)).subscribe();

    this.movieSearchResults$ = this.movieQuery.selectAll({limitTo: 10});
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
