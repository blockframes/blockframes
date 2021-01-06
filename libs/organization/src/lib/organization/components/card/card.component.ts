import { Component, Input, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { fromOrg, MovieService } from '@blockframes/movie/+state';
import { Organization } from '@blockframes/organization/+state';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getCurrentApp } from '@blockframes/utils/apps';
import { RouterQuery } from '@datorama/akita-ng-router-store';

@Component({
  selector: 'org-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationCardComponent implements OnInit {

  @Input() org: Organization;

  public orgMovieCount$: Observable<number>
  private app = getCurrentApp(this.routerQuery)


  constructor(private movieService: MovieService, private routerQuery: RouterQuery) { }

  ngOnInit() {
    this.orgMovieCount$ = this.movieService.valueChanges(fromOrg(this.org.id)).pipe(
      map(movies =>
        movies.filter(movie => movie.storeConfig.status === "accepted" && movie.storeConfig.appAccess[this.app]).length
      )
    );
  }
}
