import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { MovieQuery, Movie } from '@blockframes/movie/movie/+state';
import { StakeholderService } from '../../+state';

@Component({
  selector: 'stakeholder-view',
  templateUrl: './stakeholder-view.component.html',
  styleUrls: ['./stakeholder-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakeholderViewComponent implements OnInit {
  public movie$: Observable<Movie>;

  constructor(
    private movieQuery: MovieQuery,
    private service: StakeholderService,
    ) { }

  ngOnInit() {
    this.movie$ = this.movieQuery.selectActive();
  }

  public removeStakeholder(stakeholderId: string) {
    const movieId = this.movieQuery.getActiveId();
    this.service.remove(movieId, stakeholderId);
  }
}
