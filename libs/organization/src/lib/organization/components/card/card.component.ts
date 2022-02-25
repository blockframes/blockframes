import { Component, Input, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { fromOrgAndAccepted, MovieService } from '@blockframes/movie/+state';
import { Organization } from '@blockframes/organization/+state';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppGuard } from '@blockframes/utils/routes/app.guard';

@Component({
  selector: 'org-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationCardComponent implements OnInit {

  @Input() org: Organization;

  public orgMovieCount$: Observable<number>
  public app = this.appGuard.currentApp

  constructor(private movieService: MovieService, private appGuard: AppGuard) { }

  ngOnInit() {
    this.orgMovieCount$ = this.movieService.valueChanges(fromOrgAndAccepted(this.org.id, this.app)).pipe(
      map(movies =>
        movies.filter(movie => movie.app[this.app].access).length
      )
    );
  }
}
