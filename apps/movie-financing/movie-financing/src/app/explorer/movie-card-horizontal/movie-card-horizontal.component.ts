import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FinancingMovie } from '../search/search.component';
import { AuthQuery, User } from '@blockframes/auth';
import { Observable } from 'rxjs';

@Component({
  selector: 'financing-movie-card-horizontal',
  templateUrl: './movie-card-horizontal.component.html',
  styleUrls: ['./movie-card-horizontal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinancingMovieCardHorizontalComponent implements OnInit {
  @Input() swapVisual: boolean;
  @Input() movie: FinancingMovie | any;
  public user$: Observable<User>;

  constructor(public query: AuthQuery) {
  }

  get progress() {
    // TODO: should go in the movie type
    return this.movie.principalInformations.percentage * 100;
  }

  ngOnInit() {
    this.user$ = this.query.user$;
  }
}
