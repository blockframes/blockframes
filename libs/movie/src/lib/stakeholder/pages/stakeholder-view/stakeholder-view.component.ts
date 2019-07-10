import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { MovieQuery, Movie } from '@blockframes/movie/movie/+state';
import { StakeholderService } from '../../+state';
import { PermissionsQuery } from 'libs/organization/src/lib/permissions/+state';

@Component({
  selector: 'stakeholder-view',
  templateUrl: './stakeholder-view.component.html',
  styleUrls: ['./stakeholder-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakeholderViewComponent implements OnInit {
  public movie$: Observable<Movie>;
  public isOrgAdmin$: Observable<boolean>;

  constructor(
    private movieQuery: MovieQuery,
    private service: StakeholderService,
    private permissionsQuery: PermissionsQuery,
    ) { }

  ngOnInit() {
    this.movie$ = this.movieQuery.selectActive();
    this.isOrgAdmin$ = this.permissionsQuery.isOrgAdmin$
  }

  public removeStakeholder(stakeholderId: string) {
    const movieId = this.movieQuery.getActiveId();
    this.service.remove(movieId, stakeholderId);
  }
}
