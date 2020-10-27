import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { switchMap, map } from 'rxjs/operators';
import { ViewComponent } from '../view/view.component';
import { MovieService, MovieQuery } from '@blockframes/movie/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'financiers-marketplace-organization-title',
  templateUrl: './title.component.html',
  styleUrls: ['./title.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleComponent implements OnInit {
  // Todo Try to filter movie before sync with the store
  public titles$ = this.query.selectAll({filterBy: movies => movies.storeConfig.status === 'accepted' && movies.storeConfig.appAccess.financiers});

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
      switchMap(movieIds => this.service.valueChanges(movieIds)),
      map(movies => movies.filter(movie => movie.storeConfig.status === 'accepted' && movie.storeConfig.appAccess.financiers)),
    ); // TODO query can be improved after issue #3498
  }

}
