import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Material } from '../../material/+state';
import { Movie } from 'libs/movie/src/lib/movie/+state/movie.model';
import { MovieQuery } from 'libs/movie/src/lib/movie/+state/movie.query';
import { DeliveryService } from '../+state/delivery.service';
import { DeliveryQuery } from '../+state';

@Component({
  selector: 'delivery-movie-materials',
  templateUrl: './movie-materials.component.html',
  styleUrls: ['./movie-materials.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieMaterialsComponent implements OnInit {

  public movie$: Observable<Movie>;
  public materials$: Observable<Object>;
  public progressionValue$: Observable<number>;

  constructor(
    private movieQuery: MovieQuery,
    private deliveryService: DeliveryService,
    private deliveryQuery: DeliveryQuery,
    ) {}

  ngOnInit() {
    this.movie$ = this.movieQuery.selectActive();
    this.materials$ = this.deliveryQuery.materialsByActiveMovie$;
    this.progressionValue$ = this.deliveryQuery.movieProgression$;
  }

  public deliveredToggle(material: Material, movieId: string) {
    this.deliveryService
      .deliveredToggle(material, movieId)
      .catch(err => console.log(err));
  }

  public randomNumberPicker(scale: number) {
    return Math.floor(Math.random() * scale) + 1;
  }

}
