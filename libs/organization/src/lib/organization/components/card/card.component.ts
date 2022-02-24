import { Component, Input, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { fromOrgAndAccepted, MovieService } from '@blockframes/movie/+state';
import { Organization } from '@blockframes/organization/+state';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getCurrentApp } from '@blockframes/utils/apps';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'org-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationCardComponent implements OnInit {

  @Input() org: Organization;

  public orgMovieCount$: Observable<number>
  public app = getCurrentApp(this.route)

  constructor(private movieService: MovieService, private route: ActivatedRoute,) { }

  ngOnInit() {
    this.orgMovieCount$ = this.movieService.valueChanges(fromOrgAndAccepted(this.org.id, this.app)).pipe(
      map(movies =>
        movies.filter(movie => movie.app[this.app].access).length
      )
    );
  }
}
