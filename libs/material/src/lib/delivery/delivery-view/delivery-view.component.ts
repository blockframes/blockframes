import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { DeliveryQuery, DeliveryService } from '../+state';
import { Movie, MovieQuery, MovieService, Stakeholder } from '@blockframes/movie';


@Component({
  selector: 'delivery-view',
  templateUrl: './delivery-view.component.html',
  styleUrls: ['./delivery-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryViewComponent implements OnInit {
  public movie$: Observable<Movie>;
  public stakeholders$: Observable<Stakeholder[]>;
  public materials$: Observable<Object>;
  public progressionValue$: Observable<number>;

  constructor(
    private movieService: MovieService,
    private movieQuery: MovieQuery,
    private query: DeliveryQuery,
    ) {}

  ngOnInit() {
    this.movie$ = this.movieQuery.selectActive();
    this.stakeholders$ = this.movieService.activeMovieStakeholders;
    this.materials$ = this.query.materialsByActiveDelivery$;
    this.progressionValue$ = this.query.deliveryProgression$;
  }

  public randomNumberPicker(scale: number) {
    return Math.floor(Math.random() * scale) + 1;
  }

}
