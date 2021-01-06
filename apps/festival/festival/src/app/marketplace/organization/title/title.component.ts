import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { switchMap, map } from 'rxjs/operators';
import { ViewComponent } from '../view/view.component';
import { MovieService, Movie } from '@blockframes/movie/+state';
import { scaleIn } from '@blockframes/utils/animations/fade';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { sortMovieBy } from '@blockframes/utils/helpers';
import { Observable } from 'rxjs';

@Component({
  selector: 'festival-marketplace-organization-title',
  templateUrl: './title.component.html',
  styleUrls: ['./title.component.scss'],
  animations: [scaleIn],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleComponent implements OnInit {
  public titles$: Observable<Movie[]>;

  constructor(
    private service: MovieService,
    private parent: ViewComponent,
    private dynTitle: DynamicTitleService
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Sales Agent', 'Line-up');
    this.titles$ = this.parent.org$.pipe(
      switchMap(org => {
        return this.service.valueChanges(ref => ref
          .where('orgIds', 'array-contains', org.id)
          .where('storeConfig.status', '==', 'accepted')
          .where('storeConfig.appAccess.festival', '==', true))
      }),
      map(movies => movies.sort((a, b) => sortMovieBy(a, b, 'Production Year')))
    );
  }

}
