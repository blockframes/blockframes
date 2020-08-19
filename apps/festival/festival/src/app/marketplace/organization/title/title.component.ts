import { Component, OnInit, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { switchMap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ViewComponent } from '../view/view.component';
import { MovieService, Movie } from '@blockframes/movie/+state';
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
  @HostBinding('@scaleIn') private animePage;
  public movies$: Observable<Movie[]>;

  constructor(
    private service: MovieService,
    private parent: ViewComponent,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Sales Agent', 'Line-up');
    this.movies$ = this.parent.org$.pipe(
      map(org => org.movieIds),
      switchMap(movieIds => this.service.valueChanges(movieIds)),
      map(movies => movies.filter(movie => movie.main.storeConfig.status === 'accepted' && movie.main.storeConfig.appAccess.festival)),
    );
  }

}
