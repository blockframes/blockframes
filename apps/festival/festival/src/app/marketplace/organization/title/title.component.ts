import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { switchMap, map, tap } from 'rxjs/operators';
import { ViewComponent } from '../view/view.component';
import { MovieService, MovieQuery } from '@blockframes/movie/+state';
import { scaleIn } from '@blockframes/utils/animations/fade';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { sortMovieBy } from '@blockframes/utils/akita-helper/sort-movie-by';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'festival-marketplace-organization-title',
  templateUrl: './title.component.html',
  styleUrls: ['./title.component.scss'],
  animations: [scaleIn],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleComponent implements OnInit {
  // Todo Try to filter movie before sync with the store
  public titles$ = this.query.selectAll({ filterBy: movies => movies.storeConfig.status === 'accepted' && movies.storeConfig.appAccess.festival });

  constructor(
    private service: MovieService,
    private parent: ViewComponent,
    private dynTitle: DynamicTitleService,
    private query: MovieQuery
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Sales Agent', 'Line-up');
    this.titles$ = this.parent.org$.pipe(
      map(org => org.movieIds),
      switchMap(movieIds => {
        const movies$ = movieIds.map(id => this.service.valueChanges(ref => ref
          .where('id', '==', id)
          .where('storeConfig.status', '==', 'accepted')
          .where('storeConfig.appAccess.festival', '==', true)))
        return combineLatest(movies$).pipe(map(movies => movies.flat().filter(movie => !!movie)))
      }),
      map(movies => movies.sort((a, b) => sortMovieBy(a, b, 'Production Year')))
    ); // TODO query can be improved after issue #3498
  }

}
