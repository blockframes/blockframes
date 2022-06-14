import { Component, Input, ChangeDetectionStrategy, OnInit, Inject } from '@angular/core';
import { fromOrgAndAccepted, MovieService } from '@blockframes/movie/service';
import { Organization, App } from '@blockframes/model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { APP } from '@blockframes/utils/routes/utils';
import { boolean } from '@blockframes/utils/decorators/decorators';

@Component({
  selector: 'org-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationCardComponent implements OnInit {

  @Input() org: Organization;
  @Input() @boolean showMovieIcon = true

  public orgMovieCount$: Observable<number>;

  constructor(private movieService: MovieService, @Inject(APP) public app: App) { }

  ngOnInit() {
    this.orgMovieCount$ = this.movieService.valueChanges(fromOrgAndAccepted(this.org.id, this.app)).pipe(
      map(movies =>
        movies.filter(movie => movie.app[this.app].access).length
      )
    );
  }
}
