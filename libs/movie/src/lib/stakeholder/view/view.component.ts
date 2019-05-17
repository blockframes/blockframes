import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { MovieQuery, Movie } from '@blockframes/movie/movie/+state';

@Component({
  selector: 'stakeholder-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakeholderViewComponent implements OnInit {
  public movie$: Observable<Movie>;

  constructor(private movieQuery: MovieQuery) { }

  ngOnInit() {
    this.movie$ = this.movieQuery.selectActive();
  }
}
