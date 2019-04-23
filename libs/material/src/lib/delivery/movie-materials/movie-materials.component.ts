import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Movie } from 'libs/movie/src/lib/movie/+state/movie.model';
import { MovieQuery } from 'libs/movie/src/lib/movie/+state/movie.query';
import { DeliveryQuery } from '../+state';
import { Stakeholder, StakeholderService } from '@blockframes/movie';

@Component({
  selector: 'delivery-movie-materials',
  templateUrl: './movie-materials.component.html',
  styleUrls: ['./movie-materials.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieMaterialsComponent implements OnInit {
  public movie: Movie;
  public stakeholders$: Observable<Stakeholder[]>;
  public materials$: Observable<Object>;
  public progressionValue$: Observable<number>;

  public isAlive = true;

  constructor(
    private shService: StakeholderService,
    private movieQuery: MovieQuery,
    private query: DeliveryQuery
  ) {}

  ngOnInit() {
    this.movie = this.movieQuery.getActive();
    this.stakeholders$ = this.shService.activeMovieStakeholders;
    this.materials$ = this.query.materialsByActiveMovie$;
    this.progressionValue$ = this.query.movieProgression$;
  }

  public randomNumberPicker(scale: number) {
    return Math.floor(Math.random() * scale) + 1;
  }
}
