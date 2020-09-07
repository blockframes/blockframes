import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { switchMap, map } from 'rxjs/operators';
import { ViewComponent } from '../view/view.component';
import { MovieService, MovieQuery } from '@blockframes/movie/+state';
import { scaleIn } from '@blockframes/utils/animations/fade';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'festival-marketplace-organization-title',
  templateUrl: './title.component.html',
  styleUrls: ['./title.component.scss'],
  animations: [scaleIn],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleComponent implements OnInit {
  // Todo Try to filter movie before sync with the store
  public titles$ = this.query.selectAll({filterBy: movies => movies.storeConfig.status === 'accepted' && movies.storeConfig.appAccess.festival});

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
      map(movies => movies.filter(movie => movie.storeConfig.status === 'accepted' && movie.storeConfig.appAccess.festival)),
    ); // TODO query can be improved after issue #3498
  }

}
