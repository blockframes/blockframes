import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Subscription, Observable } from 'rxjs';

import { MovieService, MovieQuery } from '@blockframes/movie/+state';
import { algolia } from '@env';
import { FormControl } from '@angular/forms';
import { staticModels } from '@blockframes/utils/static-model';
import { MovieSearchForm } from '@blockframes/movie/form/search.form';


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
  public genres = staticModels['GENRES'];
  public countries = staticModels['TERRITORIES'];
  public movieProductionStatuses = staticModels['MOVIE_STATUS'];
  public movieIndex = algolia.indexNameMovies;


  public filterForm = new MovieSearchForm();

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
